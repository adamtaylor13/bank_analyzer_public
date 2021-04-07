#!/bin/bash

mongorestore \
 --host 127.0.0.1:27017 \
 --drop \
 --gzip \
 --nsInclude usaa_records.* \
 --db bank_analyzer \
 ./db_dump/
