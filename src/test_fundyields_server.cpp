#include <stdio.h>
#include <stdlib.h>

#include <cstring>
#include <iostream>
#include <memory>
#include <sstream>
#include <string>
#include <vector>

#include "constants.h"
#include "okapi_http.h"
#include "okapi_logging.h"
#include "okapi_object.h"
#include "okapi_socket_io.h"

using namespace okapi;
using std::cout;
using std::endl;
using std::ostringstream;
using std::string;
using std::unique_ptr;
using std::vector;

static Object SendRequest(const string &uri, const string &body, int expected_status) {
  string full_uri = "fundyields/api/" + uri;
  HTTPResponse hr;
  if (! HTTPPost("localhost", kServerPort, full_uri, body, hr)) {
    fprintf(stderr, "HTTPPost return false\n");
    exit(-1);
  }
  fprintf(stderr, "Status %i reason %s response %s\n", hr.Status(), hr.Reason().c_str(),
	  hr.Body().c_str());
  if (hr.Status() != expected_status) {
    FatalError("Expected status %i; got %i\n", expected_status, hr.Status());
  }
  Object o = std::move(hr.GetObject());
  if (o.GetType() == ObjectValueType::OBJECT && o.Contains("error_msg")) {
    string error_msg = (string)o["error_msg"];
    FatalError("Error: %s\n", error_msg.c_str());
  }
  return o;
}

static void Get(void) {
  Object o{"api", "1.0"};
  Object response = SendRequest("get", o.JSON(), 200);
  cout << response.JSON() << endl;
}

static void Set(void) {
  Object o{"api", "1.0", "funds", {"[", {"ticker", "abcde", "sec_yield", 1.2}, {"ticker", "vwxyz", "sec_yield", 3.4}, "]"}};
  Object response = SendRequest("set", o.JSON(), 200);
  cout << response.JSON() << endl;
}

static void Usage(const char *prog_name) {
  fprintf(stderr, "USAGE: %s\n", prog_name);
  exit(-1);
}

int main(int argc, char *argv[]) {
  if (argc != 1) Usage(argv[0]);
  Set();
  Get();
}
