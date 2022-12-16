#ifndef _FUNDYIELDS_SERVER_H_
#define _FUNDYIELDS_SERVER_H_

#include <memory>
#include <string>

#include "context.h"
#include "okapi_server.h"

class NBSocketIO;
class Object;
class redisContext;

class FundYieldsThreadData : public ThreadData {
public:
  FundYieldsThreadData(void);
  ~FundYieldsThreadData(void);
  redisContext *RedisContext(void) const {return redis_context_;}
private:
  redisContext *redis_context_;
};

class FundYieldsServer : public Server {
 public:
  FundYieldsServer(int num_workers, int port);
  ~FundYieldsServer(void) {}
  void HandleRequest(const NBSocketIO &socket_io, const ThreadData &thread_data);
 private:
  static const std::string kProtocol;

  void Get(const Object &request, const NBSocketIO &socket_io, const Context &context);
  void HandleRequest(const std::string &uri, const Object &request, const NBSocketIO &socket_io,
		     Context &context);
  std::unique_ptr<ThreadData> GenerateThreadData(void);

};

#endif
