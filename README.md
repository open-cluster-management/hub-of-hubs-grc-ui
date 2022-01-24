[comment]: # ( Copyright Contributors to the Open Cluster Management project )

# grc-ui
[![Build](https://img.shields.io/badge/build-Prow-informational)](https://prow.ci.openshift.org/?repo=open-cluster-management%2Fgrc-ui)
[![License](https://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

The UI microservice, `grc-ui`, is the governance and risk dashboard for Red Hat Advanced Cluster Management. (See [`grc-ui-api`](https://github.com/stolostron/grc-ui-api) for the API Server microservice it uses)

## Design

The UI Platform is developed as an isomorphic React application. View the list of major components that are used to build this service:

* NodeJS
* Express
* React
* Handlebars
* Redux
* Webpack
* Babel
* Apollo/GraphQL
* RedHat PatternFly
* Jest
* Nightwatch


## Build

- Install the modules

   ```bash
   npm install
   ```
- Build the project


   ```bash
      npm run build
   or npm run build:watch
   or npm run build:production
   ```

## Run installation

**SECURITY WARNING:** The GRC UI provides an SSL certificate in `/sslcert` that is open to the public. In order to run this in production, you'll need to replace these certificates. For our production builds, we replace these certificates using its Helm chart.

1. Setup environment
   You need:
   - to be connected to a OpenShift 4.x.x cluster
   - to have Advanced Cluster Management installed on the cluster
   - Run one of the following commands:

   ```
   npm run setup
   OR
   ./setup-env.sh
   ```

   This will create a `.env` file in the main directory containing the environment variables. You can run `source .env` to set the variables for use.

   The `SERVICEACCT_TOKEN` expires so if you need to get a new one:
   - From the UI...
      - Go to the RHACM Hub, enter the Hub login info, and hit “configure client” from the menu in the top right
   - With the CLI...
      - Login to the RHACM Hub with `oc` using the API Server URL and run
      
         ```bash
         oc whoami -t
         ```
    
    Note: If you want to develop against both the grc-ui & the grc-ui-api you can start the API server and configure the grc-ui to query against the local grc-ui-api server. If you have already sourced the `.env` file you can run `unset grcUiApiUrl` to revert to using the default localhost url for communication with grc-ui-api. See the following on how to setup the api server: [`grc-ui-api`](https://github.com/stolostron/grc-ui-api).

2. Start the server for production by running the following command:

   ```bash
   npm run start:production
   ```

3. Start the server for development by running the following commands:

   ```bash
   npm run build:watch
   npm run start
   ```

5.Open a browser to `https://localhost:3000/multicloud/policies` and log in using your cluster admin credentials.

## Testing

### Unit Tests

Run the following command to start all unit tests (run through Jest):

```bash
npm run test:unit
```

### Cypress Tests

**Note**: It is required that the UI runs locally or can target a remote cluster to start the selenium based tests.

1. Before you run any cypress test, make sure the following envs are set.

   ```bash
   export OC_HUB_CLUSTER_URL=    # API URL for remote hub cluster
   export OC_CLUSTER_USER=       # User with which to log into the hub cluster
   export OC_HUB_CLUSTER_PASS=   # Password for user to authenticate to hub cluster
   export OC_IDP=                # Identity Provider to log in with (Use 'kube:admin' for logging in with kubeadmin)
   ```

2. The RBAC tests require a set of users to exist in the remote cluster. To set up these users, first log in to your remote cluster. Decide on a password you'd like to use for these users. Then, from the `grc-ui` folder, run these commands (the script will also export `OC_CLUSTER_USER`, `OC_HUB_CLUSTER_PASS`, and `OC_IDP` to match the RBAC users and use in place of `kubeadmin`):

   ```bash
   export RBAC_PASS=<your-rbac-password>
   source ./build/rbac-setup.sh
   ```

   For reference, the following users will be created:

   | USER | ACCESS | ROLE |
   | --- | --- | --- |
   | e2e-cluster-admin-cluster | Cluster | cluster-admin |
   | e2e-admin-cluster | Cluster | admin |
   | e2e-edit-cluster | Cluster | edit |
   | e2e-view-cluster | Cluster | view |
   | e2e-group-cluster | Cluster | view |
   | e2e-cluster-admin-ns | Namespace | cluster-admin for `e2e-rbac-test-1` |
   | e2e-admin-ns | Namespace | admin for `e2e-rbac-test-1`</br>view for `e2e-rbac-test-2` |
   | e2e-edit-ns | Namespace | edit for `e2e-rbac-test-1` |
   | e2e-view-ns | Namespace | view for `e2e-rbac-test-1` |
   | e2e-group-ns | Namespace | view for `e2e-rbac-test-1` |

3. **Optional**: By default, cypress test runs against a live cluster. You can run cypress test against localhost. Set the environment parameter, `CYPRESS_BASE_URL` by running the following command:

   ```bash
   export CYPRESS_BASE_URL=https://localhost:3000
   ```

4. Run the following command to start the cypress test:
   
   **NOTE:** Running `npx cypress` is not recommended. There is logic in the script called in the `npm` commands that will customize the test run for your cluster.
   - To run the tests with a live browser:
     ```bash
     npm run test:cypress
     ```
     **NOTE:** To open Cypress in an interactive mode and run tests individually, first run `export NODE_ENV=debug` before starting the headful tests

   - To run the tests headless (i.e. with the browser running in the background):
     ```bash
     npm run test:cypress-headless
     ```


## NPM Commands

View the full list of npm scripts that are described in the following table:

| Command                          | Description                                                                                                                      |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| `npm start`                      | Starts the application with NODE_ENV='development'.                                                                               |
| `npm run test:unit`                  | Runs jest tests.                                                                                                                |
| `npm run test:update-snapshot`       | Updates snapshots for jest tests. This command should only be used if you have made changes to a component that requires an updated snapshot artifact for a test case.|
| `npm run test:cypress`               | Runs Cypress e2e tests. |
| `npm run test:cypress-headless`      | Runs Cypress e2e tests with headless browser (i.e. browser runs in the background). |
| `npm run start:production`       | Starts the application with NODE_ENV='production'.                                                                                |
| `npm run clean`                  | Deletes the generated files from public folder.                                                                                  |
| `npm run build`                  | Does a FULL development build.  (caching disabled and dev source maps)                                                           |
| `npm run build:production`       | Does a FULL production build.                                                                                                    |
| `npm run build:watch`            | Does a build of application code (w/o the DLL generation) and continues to run in the background watching for changes.            |
| `npm run build:dll`              | Only re-builds the the vendor library component.                                                                                 |
| `npm run lint`                   | Runs linting on the code base.                                                                                                   |
| `npm run lint:fix`               | Attempts to fix any linting errors automatically.                                                                                |

  **Note**: The build process leverages the Dll and DllReference plugins to extract vendor plugins for faster build times and improve browser caching.  A separate bundle is created for 3rd-party client-side libraries.  The generated bundle is sourced (_public/dll.vendor.js_) along with its manifest (_vendor-manifest.json_).  If new client dependencies are added or existing versions of dependencies are updated, this module needs to be regenerated and recommitted back into source control. Run the following command  `npm run build:dll`.

## Links

These are a few useful links that provide technical reference and best practices when developing for the platform.

- [Patternfly](https://www.patternfly.org/v4/)
- [Webpack](https://webpack.js.org)
- [React Docs](https://facebook.github.io/react/docs/hello-world.html)
- [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html)
- [Redux](http://redux.js.org)
- [Structuring Redux State](https://hackernoon.com/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a)
- [React Best Practices](https://engineering.musefind.com/our-best-practices-for-writing-react-components-dec3eb5c3fc8)
- [Smart and Dumb Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [Redux Best Practices](https://medium.com/@kylpo/redux-best-practices-eef55a20cc72)

<!---
Date: 09/27/2021
-->

