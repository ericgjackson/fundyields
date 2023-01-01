#include <cstdio>
#include <cstdlib>
#include <string>

#include "constants.h"
#include "fundyields_server.h"
#include "okapi_text_processing.h"

using namespace okapi;
using std::string;

static void Usage(const char *prog_name) {
  fprintf(stderr, "USAGE: %s (port)\n", prog_name);
  exit(-1);
}

int main(int argc, char *argv[]) {
  if (argc != 1 && argc != 2) Usage(argv[0]);
  int port = kServerPort;
  if (argc == 2) {
    if (! StringToInt(argv[1], port)) Usage(argv[0]);
  }
  FundYieldsServer server(2, port);
  server.MainLoop();
}
