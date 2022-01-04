
/* Copyright (c) 2021 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */

'use strict'

import React from 'react'
import '../scss/common.scss'
import { HubOfHubsHeader, HubOfHubsRoute } from 'hub-of-hubs-ui-components'
import PropTypes from 'prop-types'
import { Route, Switch, Redirect, withRouter } from 'react-router-dom'
import client from '../../server/lib/shared/client'
import config from '../../server/lib/shared/config'
import Modal from '../components/common/Modal'
import Page from '../components/common/Page'
// eslint-disable-next-line import/no-named-as-default
import CreationTab from './CreationTab'
import AcmGrcPage from './AcmGrcPage'
import { LocaleContext } from '../components/common/LocaleContext'
import { getUserAccessData } from '../actions/access'
import { connect } from 'react-redux'

class App extends React.Component {

  static propTypes = {
    match: PropTypes.object,
    staticContext: PropTypes.object,
    url: PropTypes.string,
    userAccess: PropTypes.array,
  }

  constructor(props) {
    super(props)
    if (client && document.getElementById('propshcm')) {
      this.serverProps = JSON.parse(document.getElementById('propshcm').textContent)
    }
  }

  getServerProps() {
    if (client) {
      return this.serverProps
    }
    return this.props.staticContext
  }

  componentDidMount() {
    this.props.getUserAccess()
  }

  render() {
    const serverProps = this.getServerProps()
    const { match, userAccess } = this.props
    const locale = serverProps.context.locale
    const props = { userAccess, locale }
    return (
      <LocaleContext.Provider value={serverProps.context}>
        <Page>
          <Switch>
            {/* Removes trailing slashes in the URL */}
            <Route path="/:url*(/+)" exact strict render={({ location }) => <Redirect to={location.pathname.replace(/\/+$/, '')} />} />
            {/* Removes duplicate slashes in the middle of the URL */}
            <Route path="/:url(.*//+.*)" exact strict render={({ match: { params }})=> <Redirect to={`/${params.url.replace(/\/\/+/, '/')}`} />} />
            <Route path={`${match.url}/all/:namespace/:name/status/:cluster/templates/:template/history`} exact
              render={() => <AcmGrcPage type='POLICY_STATUS_HISTORY' {...props} />} />
            <Route path={`${match.url}/all/:namespace/:name/template/:cluster/:apiGroup/:version/:kind/:template`} exact
              render={() => <AcmGrcPage type='POLICY_TEMPLATE_DETAILS' {...props} />} />
            <Route path={`${match.url}/all/:namespace/:name/edit`} exact component={CreationTab} />
            <Route path={`${match.url}/all/:namespace/:name/clusters`} exact render={() => <AcmGrcPage type='POLICY_CLUSTERS' {...props} />} />
            <Route path={`${match.url}/all/:namespace/:name/templates`} exact render={() => <AcmGrcPage type='POLICY_TEMPLATES' {...props} />} />
            <Route path={`${match.url}/all/:namespace/:name`} exact render={() => <AcmGrcPage type='SINGLE_POLICY' {...props} />} />
            <Route path={`${match.url}/all`} exact render={() => <AcmGrcPage type='ALL_POLICIES' {...props} />} />
            <Route path={`${match.url}/create`} exact component={CreationTab} />
            <Redirect to={`${config.contextPath}/all`} />
          </Switch>
        </Page>
        <Modal locale={locale} />
      </LocaleContext.Provider>
    )
  }
}

App.propTypes = {
  getUserAccess: PropTypes.func
}
const mapStateToProps = (state) => {
  return {
    userAccess: state.userAccess && state.userAccess.access ? state.userAccess.access : [],
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    getUserAccess: () => dispatch(getUserAccessData())
  }
}

const AppWithUserAccess = withRouter(connect(mapStateToProps, mapDispatchToProps)(App))

const getHubOfHubsRoute = (props) => {
  let path = ''
  if (client) {
    path = window.location.pathname
  } else {
    path = props.url
  }
  if (path.includes(config.contextPath)) {
    return HubOfHubsRoute.Governance
  }

  return HubOfHubsRoute.Clusters
}

// eslint-disable-next-line react/display-name
export default props => (
  <HubOfHubsHeader route={getHubOfHubsRoute(props)} >
    <Route path={config.contextPath} serverProps={props} component={AppWithUserAccess} />
  </HubOfHubsHeader>
)
