#include <cstdio>
#include <memory>
#include <string>
#include <vector>

#include "context.h"
#include "okapi_redis.h"
#include "okapi_socket_io.h"
#include "okapi_text_processing.h"

using namespace okapi;
using std::string;
using std::vector;

Context::Context(RedisConnection &redis_connection, const SocketIO &socket_io,
		 const string &origin) :
  redis_connection_(redis_connection), socket_io_(socket_io), origin_(origin) {
  major_api_version_ = 0;
  minor_api_version_ = 0;
}

// API should be a string, e.g., "4.53" (major version 4, minor version 53)
// For minor version 30, use ".30", not ".3".
void Context::SetAPIVersion(const string &v) {
  vector<string> comps;
  SplitOn(v, '.', comps);
  if (comps.size() == 2) {
    // TODO: check for errors
    StringToInt(comps[0], major_api_version_);
    StringToInt(comps[1], minor_api_version_);
  }
}
