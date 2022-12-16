#include <hiredis/hiredis.h>

#include <cstdio>
#include <memory>
#include <string>
#include <vector>

#include "context.h"
#include "okapi_regex.h"

using std::string;
using std::vector;

Context::Context(redisContext *redis_context) {
  redis_context_ = redis_context;
  major_api_version_ = 0;
  minor_api_version_ = 0;
}

// API should be a string, e.g., "4.53" (major version 4, minor version 53)
// For minor version 30, use ".30", not ".3".
void Context::SetAPIVersion(const string &v) {
  vector<string> comps;
  SplitOn(v, '.', comps);
  if (comps.size() == 2) {
    sscanf(comps[0].c_str(), "%i", &major_api_version_);
    sscanf(comps[1].c_str(), "%i", &minor_api_version_);
  }
}
