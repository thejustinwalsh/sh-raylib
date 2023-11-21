#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#ifndef RESOURCE_PATH
#define RESOURCE_PATH "./resources/"
#endif

static inline char* _get_resource_path(char *path) {
  char *p = (char*)malloc(strlen(RESOURCE_PATH) + strlen(path) + 1);
  strcpy(p, RESOURCE_PATH);
  strcat(p, path);
  return p;
}