#include <hiredis/hiredis.h>

#include <exception>
#include <memory>
#include <string>
#include <vector>

#include "constants.h"
#include "context.h"
#include "fundyields_server.h"
#include "okapi_http.h"
#include "okapi_logging.h"
#include "okapi_nb_socket_io.h"
#include "okapi_object.h"
#include "okapi_redis.h"

using std::exception;
using std::string;
using std::pair;
using std::unique_ptr;
using std::vector;

const string FundYieldsServer::kProtocol = "HTTP/1.1";

class UnknownURIException : public std::exception {
public:
  UnknownURIException(const string &uri);
  ~UnknownURIException(void) {}
  const char* what() const throw() {
    return message_.c_str();
  }
private:
  string message_;
};

UnknownURIException::UnknownURIException(const string &uri) {
  message_ = "Unknown URI: \"";
  message_ += uri;
  message_ += "\"";
}

void FundYieldsServer::Get(const Object &request, const NBSocketIO &socket_io,
			const Context &context) {
  redisContext *redis_context = context.RedisContext();
  Object response_json{"[", "]"};
  int cursor = 0;
  do {
    RedisResponse rr(redis_context, "SCAN %i MATCH *", cursor);
    const redisReply *reply = rr.Reply();
    if (! reply) {
      Warning("SCAN failed\n");
      break;
    }
    if (reply->type != REDIS_REPLY_ARRAY) {
      if (reply->type == REDIS_REPLY_ERROR) {
	Warning("SCAN returned REDIS_REPLY_ERROR (%s)\n", reply->str);
      } else if (reply->type == REDIS_REPLY_STATUS) {
	Warning("SCAN returned REDIS_REPLY_STATUS (%s)\n", reply->str);
      } else {
	Warning("SCAN reply type %i\n", (int)reply->type);
      }
      break;
    }
    if (reply->elements != 2) {
      Warning("SCAN did not return 2 elements\n");
      break;
    }
    struct redisReply *first_element = reply->element[0];
    if (first_element->type != REDIS_REPLY_STRING) {
      Warning("First element returned from SCAN not string\n");
      break;
    }
    if (sscanf(first_element->str, "%i", &cursor) != 1) {
      Warning("Couldn't parse returned cursor value %s\n", first_element->str);
      break;
    }
    struct redisReply *second_element = reply->element[1];
    if (second_element->type != REDIS_REPLY_ARRAY) {
      Warning("Second element returned from SCAN not array\n");
      break;
    }
    int num = second_element->elements;
    for (int i = 0; i < num; ++i) {
      struct redisReply *element = second_element->element[i];
      if (element->type != REDIS_REPLY_STRING) {
	Warning("Nested element returned from SCAN not string\n");
	break;
      }
      string key = element->str;
      RedisResponse rr(redis_context, "GET %s", key.c_str());
      string data = rr;
      Object fund = Object::FromJSON(data);
      // Add the ticker as a field to the object representing the fund
      fund.AddKVPair("ticker", key);
      response_json.AddValue(std::move(fund));
    }
  } while (cursor != 0);
  HTTPSendPostResponse(socket_io, kProtocol, 200, "OK", response_json.JSON());
}

void FundYieldsServer::HandleRequest(const std::string &in_uri, const Object &request,
				  const NBSocketIO &socket_io, Context &context) {
  // In testing, we sometimes send API requests to /fundyields2/.
  string uri = in_uri;
  size_t start_pos = in_uri.find("/fundyields2/");
  if (start_pos != string::npos) {
    uri.replace(start_pos, 10, "/fundyields/");
  }

  if (request.Contains("api")) {
    context.SetAPIVersion((string)request["api"]);
  }

  if (uri == "/fundyields/api/get") {
    Get(request, socket_io, context);
  } else {
    Warning("Unknown URI: %s\n", uri.c_str());
    // Might want to return status of 404 rather than 400 for this exception
    UnknownURIException e(uri);
    throw e;
  }
}

void FundYieldsServer::HandleRequest(const NBSocketIO &socket_io, const ThreadData &thread_data) {
  string uri, protocol;

  Object request;
  try {
    request = HTTPReceivePostJSON(socket_io, uri, protocol);
  } catch (HTTPFailedRequestException &e) {
    // Normal for HTTPReceivePostJSON() to throw; generally just means the client closed the
    // socket.  Don't print a warning.
    // TODO: distinguish between exceptions that deserve a warning and those that don't.
    HTTPSendPostResponse(socket_io, kProtocol, 400, "Badly formed request", "");
    return;
  }
  if (request.GetType() != ObjectValueType::OBJECT) {
    Warning("Expected JSON object in POST request\n");
    HTTPSendPostResponse(socket_io, kProtocol, 400, "Badly formed request", "");
    return;
  }

  const FundYieldsThreadData &wr_thread_data =
    dynamic_cast<const FundYieldsThreadData &>(thread_data);
  redisContext *redis_context = wr_thread_data.RedisContext();
  Context context(redis_context);
  try {
    HandleRequest(uri, request, socket_io, context);
  } catch (exception &e) {
    Warning("Exception: %s\n", e.what());
    HTTPSendPostResponse(socket_io, kProtocol, 500, e.what(), "");
  }
}

static const char *kRedisHost = "localhost";
static const int kRedisPort = 6379;

FundYieldsThreadData::FundYieldsThreadData(void) {
  struct timeval timeout = { 1, 500000 }; // 1.5 seconds
  redis_context_ = redisConnectWithTimeout(kRedisHost, kRedisPort, timeout);
  if (redis_context_ == nullptr || redis_context_->err) {
    if (redis_context_) {
      FatalError("Redis connection error: %s\n", redis_context_->errstr);
    } else {
      FatalError("Redis connection error: cannot allocate redis context\n");
    }
  }
  RedisResponse rr(redis_context_, "SELECT %i", kRedisDB);
  string response = rr;
  if (response != "OK") {
    FatalError("Redis SELECT %i yielded response %s\n", kRedisDB, response.c_str());
  }
}

FundYieldsThreadData::~FundYieldsThreadData(void) {
  redisFree(redis_context_);
}

unique_ptr<ThreadData> FundYieldsServer::GenerateThreadData(void) {
  return std::make_unique<FundYieldsThreadData>();
}

FundYieldsServer::FundYieldsServer(int num_workers, int port) :
  Server(num_workers, port, 0) {
}
