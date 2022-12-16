#ifndef _CONTEXT_H_
#define _CONTEXT_H_

#include <memory>
#include <string>

class redisContext;

class Context {
 public:
  Context(redisContext *redis_context);
  void SetAPIVersion(const std::string &v);
  redisContext *RedisContext(void) const {return redis_context_;}
  int MajorAPIVersion(void) const {return major_api_version_;}
  int MinorAPIVersion(void) const {return minor_api_version_;}
 private:
  redisContext *redis_context_;
  int major_api_version_;
  int minor_api_version_;
};

#endif
