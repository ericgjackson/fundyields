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

using std::cout;
using std::endl;
using std::ostringstream;
using std::string;
using std::unique_ptr;
using std::vector;

static Object SendRequest(const string &uri, const string &body, int expected_status) {
  int content_len = body.size();
  ostringstream os;
  os << "POST /fundyields/api/" << uri << " HTTP/1.1\r\n"
    "Content-Type: application/json\r\n"
    "Content-Length: " << content_len << "\r\n\r\n" << body;
  
  int status;
  string reason, response;
  if (! HTTPPost("localhost", kServerPort, os.str(), status, reason, response)) {
    fprintf(stderr, "HTTPPost return false\n");
    exit(-1);
  }
  fprintf(stderr, "Status %i reason %s response %s\n", status, reason.c_str(), response.c_str());
  if (status != expected_status) {
    FatalError("Expected status %i; got %i\n", expected_status, status);
  }
  Object o;
  if (response == "") {
    // Special case empty string; return null JSON
    o = Object();
  } else {
    // Do not catch exception
    o = Object::FromJSON(response);
  }
  if (o.Contains("error_msg")) {
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

static void Usage(const char *prog_name) {
  fprintf(stderr, "USAGE: %s\n", prog_name);
  exit(-1);
}

int main(int argc, char *argv[]) {
  if (argc != 1) Usage(argv[0]);
  Get();
}
