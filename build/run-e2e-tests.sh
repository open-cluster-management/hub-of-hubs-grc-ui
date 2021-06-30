#!/bin/bash
# Licensed Materials - Property of IBM
# (c) Copyright IBM Corporation 2020. All Rights Reserved.
# Note to U.S. Government Users Restricted Rights:
# Use, duplication or disclosure restricted by GSA ADP Schedule
# Contract with IBM Corp.
# Copyright (c) 2020 Red Hat, Inc.
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "Login managed"
# Get env from Travis config
export OC_CLUSTER_URL=${OC_MANAGED_CLUSTER_URL:-${OC_HUB_CLUSTER_URL}}
export OC_CLUSTER_PASS=${OC_MANAGED_CLUSTER_PASS:-${OC_HUB_CLUSTER_PASS}}
make oc/login

$DIR/install-cert-manager.sh
$DIR/cluster-clean-up.sh managed

echo "Login hub"
export OC_CLUSTER_URL=$OC_HUB_CLUSTER_URL
export OC_CLUSTER_PASS=$OC_HUB_CLUSTER_PASS
make oc/login

$DIR/cluster-clean-up.sh hub

$DIR/setup-dev.sh

echo "Create RBAC users"
source $DIR/rbac-setup.sh

echo "setup cluster for test"
$DIR/cluster-setup.sh

echo "Export envs to run e2e"
export SERVICEACCT_TOKEN=`${BUILD_HARNESS_PATH}/vendor/oc whoami --show-token`
installed_namespace=`oc get subscriptions.operators.coreos.com --all-namespaces | grep advanced-cluster-management | awk '{print $1}'`
export headerUrl=https://`oc get route multicloud-console -n $installed_namespace -o=jsonpath='{.spec.host}'`
export NODE_ENV=development 
export API_SERVER_URL=$OC_HUB_CLUSTER_URL
export OAUTH2_REDIRECT_URL=${OAUTH2_REDIRECT_URL:-"https://localhost:3000/multicloud/policies/auth/callback"}
export OAUTH2_CLIENT_ID=${OAUTH2_CLIENT_ID:-"multicloudingress"}
export OAUTH2_CLIENT_SECRET=${OAUTH2_CLIENT_SECRET:-"multicloudingresssecret"}
export SELENIUM_USER=${SELENIUM_USER:-${OC_CLUSTER_USER}}
export SELENIUM_PASSWORD=${SELENIUM_PASSWORD:-${OC_HUB_CLUSTER_PASS}}

make docker/login
export DOCKER_URI=quay.io/open-cluster-management/grc-ui-api:${GRCUIAPI_VERSION:-"latest-dev"}
make docker/pull

docker run -d -t -i -p 4000:4000 --name grcuiapi -e NODE_ENV=development -e SERVICEACCT_TOKEN=$SERVICEACCT_TOKEN -e API_SERVER_URL=$API_SERVER_URL $DOCKER_URI

printenv

npm run build
npm run start:instrument &>/dev/null &
sleep 10
echo "Launching cypress e2e test"
npm run test:cypress-headless
sleep 10
echo "Launching nightwatch e2e test"
npm run test:e2e-headless

# kill the node process to let nyc generate coverage report
ps -ef | grep 'node app.js' | grep -v grep | awk '{print $2}' | xargs kill
sleep 10

sed -i 's|SF:|SF:'"$(pwd)"/'|g' test-output/server/coverage/lcov.info
sed -i 's|SF:|SF:'"$(pwd)"/'|g' test-output/cypress/coverage/lcov.info
