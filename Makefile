# Note that if any header files are missing when you try to build, things fail
# in mysterious ways.  You get told there is "No rule to make target obj/foo.o".
HEADS =	src/constants.h src/context.h src/fundyields_server.h

LIBRARIES = -pthread -lhiredis -lokapi_redis -lokapi_uuid -lokapi_http -lokapi_server \
	-lokapi_object -lokapi_socket_io -lokapi_regex -lokapi_logging

LDFLAGS = 
IFLAGS = 

# On Mac add: -DMACOS
# Need c++14 for std::make_unique
# Need c++17 for shared_ptrs of arrays
CFLAGS = $(IFLAGS) -std=c++17 -Wall -O3 -march=native -fPIC

# COMPILER = clang-3.8
COMPILER = gcc

# LINKER = clang-3.8
LINKER = g++

obj/%.o:	src/%.cpp $(HEADS)
		$(COMPILER) $(CFLAGS) -c -o $@ $<

OBJS =	obj/context.o obj/fundyields_server.o

bin/run_fundyields_server:	obj/run_fundyields_server.o $(OBJS) $(HEADS)
	$(LINKER) $(LDFLAGS) $(CFLAGS) -o bin/run_fundyields_server obj/run_fundyields_server.o \
	$(OBJS) $(LIBRARIES)

bin/test_fundyields_server:	obj/test_fundyields_server.o $(OBJS) $(HEADS)
	$(LINKER) $(LDFLAGS) $(CFLAGS) -o bin/test_fundyields_server obj/test_fundyields_server.o \
	$(OBJS) $(LIBRARIES)

install: bin/run_fundyields_server
	install bin/run_fundyields_server /usr/local/bin

clean:
	rm -f obj/* bin/*
