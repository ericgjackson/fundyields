#ifndef _FUNDYIELDS_SERVER_H_
#define _FUNDYIELDS_SERVER_H_

#include <memory>
#include <string>

#include "context.h"
#include "okapi_nb_socket_io.h"
#include "okapi_object.h"
#include "okapi_redis.h"
#include "okapi_server.h"

class FundYieldsThreadData : public okapi::ThreadData {
public:
  FundYieldsThreadData(void);
  ~FundYieldsThreadData(void);
  okapi::RedisContext &GetRedisContext(void) const {return *redis_context_;}
private:
  std::unique_ptr<okapi::RedisContext> redis_context_;
};

class FundYieldsServer : public okapi::Server {
 public:
  FundYieldsServer(int num_workers, int port);
  ~FundYieldsServer(void) {}
  void HandleRequest(const okapi::NBSocketIO &socket_io, const okapi::ThreadData &thread_data);
 private:
  static const std::string kProtocol;

  void Get(const okapi::Object &request, const Context &context);
  void Set(const okapi::Object &request, const Context &context);
  void HandleRequest(const std::string &uri, const okapi::Object &request,
		     const okapi::NBSocketIO &socket_io, Context &context);
  std::unique_ptr<okapi::ThreadData> GenerateThreadData(void);

};

#endif
