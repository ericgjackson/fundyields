#ifndef _CONTEXT_H_
#define _CONTEXT_H_

#include <memory>
#include <string>

#include "okapi_redis.h"
#include "okapi_socket_io.h"

class Context {
 public:
  Context(okapi::RedisContext &redis_context, const okapi::SocketIO &socket_io,
	  const std::string &origin);
  void SetAPIVersion(const std::string &v);
  okapi::RedisContext &GetRedisContext(void) const {return redis_context_;}
  const okapi::SocketIO &GetSocketIO(void) const {return socket_io_;}
  const std::string &Origin(void) const {return origin_;}
  int MajorAPIVersion(void) const {return major_api_version_;}
  int MinorAPIVersion(void) const {return minor_api_version_;}
 private:
  okapi::RedisContext &redis_context_;
  const okapi::SocketIO &socket_io_;
  std::string origin_;
  int major_api_version_;
  int minor_api_version_;
};

#endif
