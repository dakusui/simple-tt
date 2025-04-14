#!/usr/bin/env bash

set -eu -o pipefail -o errtrace
shopt -s inherit_errexit nullglob

source "$(dirname "${BASH_SOURCE[0]}")/lib/utils.rc"

__execute_stage_driver_filename=
__execute_stage_stage_name=
function __execute_stage() {
  local _stage="${1}"
  shift
  message "EXECUTING:${_stage}:[${*}]"
  {
    __execute_stage_driver_filename="$(dirname "${BASH_SOURCE[0]}")/drivers/${_stage}.rc"
    __execute_stage_stage_name="${_stage}"
    function execute_stage() {
      abort "The driver: '${__execute_stage_driver_filename}' does not define a function 'execute_stage'"
    }
    function stage_name() {
      echo "'${__execute_stage_stage_name}'"
    }
    # shellcheck disable=SC1090
    source "${__execute_stage_driver_filename}" || abort "Driver not found: '${__execute_stage_driver_filename}'"
    ("execute_stage" "$@" && message "DONE:${_stage}") || abort "FAILED:${_stage}"
  } || {
    message "FAILED:${_stage}"
    return 1
  }
  return 0
}

function execute() {
  if [[ "${#@}" == 0 ]]; then
    return 0
  fi
  local _first="${1}"
  shift
  if [[ "${_first}" == STOP ]]; then
    execute killall:node:npm "${@}"
  elif [[ "${_first}" == START ]]; then
    execute start:../frontend "${@}"
  elif [[ "${_first}" == STATUS ]]; then
    execute is_running "${@}"
  elif [[ "${_first}" == REFRESH_EXECUTION_ENVIRONMENT ]]; then
    execute refresh_execution_environment "${@}"
  elif [[ "${_first}" == ERASE_DATASET ]]; then
    execute wipe-datasets "${@}"
  elif [[ "${_first}" == LOAD_DATASET ]]; then
    execute upload:v2/run-1.json \
            upload:v2/run-2.json "${@}"
  else
    IFS=':' read -r -a _args <<<"${_first}"
    __execute_stage "${_args[@]}" || exit 1
    execute "${@}"
  fi
}

function main() {
  if [[ "${#@}" == 0 ]]; then
    execute STATUS
  else
    execute "${@}"
  fi
}
main "${@}"
