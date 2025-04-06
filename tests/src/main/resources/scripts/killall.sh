#!/bin/bash

function _killall() {
  local _process_name="${1}"
  for _p in $(pgrep "${_process_name}" | sed -E 's/ +/ /g' | cut -f 2 -d ' '); do
    echo "${_p}"
    kill "${_p}"
  done
}

function killall() {
  local _process_name="${1}" _interval="${2:-3}" _times="${3:-3}"
  for _i in $(seq 1 "${_times}"); do
    mapfile -t _pids < <(_killall "${_process_name}")
    if [[ "${#_pids[@]}" == 0 ]]; then
      return 0
    fi
    sleep "${_interval}"
  done
  return 1
}

function main() {
  for _i in "${@}"; do
    killall "${_i}"
  done
}

main "${@}"