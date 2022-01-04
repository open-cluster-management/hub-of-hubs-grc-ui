/* Copyright (c) 2021 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */
/* eslint-disable react/display-name */

'use strict'
import React from 'react'
import { AcmButton, AcmSecondaryNavItem } from '@open-cluster-management/ui-components'

import { ALL_POLICIES, SINGLE_POLICY } from '../../utils/client/queries'
import config from '../../../server/lib/shared/config'
// eslint-disable-next-line import/no-named-as-default
import GrcView from '../../components/modules/GrcView'
import { PolicyDetailsOverview } from '../../components/modules/PolicyDetailsOverview'
import msgs from '../../nls/platform.properties'
import { checkCreatePermission, checkEditPermission } from '../../utils/CheckUserPermission'

const policiesMsg = 'routes.policies'

export const getPageDefinition = (props) => {
  const { type } = props
  switch(type) {
    case 'ALL_POLICIES':
      return policiesPage(props)
    case 'SINGLE_POLICY':
      return policyDetailsPage(props)
  }
  return null
}

const createBtn = ({ userAccess, history, locale }) => {
  return (
    <AcmButton key='create-policy' id='create-policy' isDisabled={checkCreatePermission(userAccess)===0}
      tooltip={msgs.get('error.permission.disabled', locale)}
      onClick={() => history.push(`${config.contextPath}/create`)}>
      {msgs.get('routes.create.policy', locale)}
    </AcmButton>
  )
}

const editBtn = ({ userAccess, history, locale, name, namespace, resourceNotFound }) => {
  const noPermission = checkEditPermission(userAccess) === 0
  return (
    <AcmButton key='edit-policy' id='edit-policy' isDisabled={noPermission || resourceNotFound}
      tooltip={noPermission ? msgs.get('error.permission.disabled', locale) : msgs.get('error.not.found', locale)}
      onClick={() => history.push(`${config.contextPath}/all/${namespace}/${name}/edit`)}>
      {msgs.get('routes.edit.policy', locale)}
    </AcmButton>
  )
}

const detailsNav = ({ history, locale, name, namespace }) => {
  const url = `${config.contextPath}/all/${namespace}/${name}`
  return (
    <AcmSecondaryNavItem key='details' isActive={history.location.pathname===url}
      onClick={() => history.push(url)}>
      {msgs.get('tabs.details', locale)}
    </AcmSecondaryNavItem>
  )
}

const policiesPage = ({ locale }) => {
  return {
    id: 'policies',
    title: msgs.get('routes.grc', locale),
    query: ALL_POLICIES,
    refreshControls: true,
    buttons: [ createBtn ],
    children: (props) => <GrcView {...props} />
  }
}

const policyDetailsPage = ({ name, namespace, locale }) => {
  return {
    id: 'policy-details',
    title: name,
    query: SINGLE_POLICY,
    query_variables: { name, namespace },
    refreshControls: true,
    breadcrumb: [
      { text: msgs.get(policiesMsg, locale), to: config.contextPath },
      { text: name, to: name }
    ],
    navigation: [
      detailsNav
    ],
    buttons: [ editBtn ],
    children: (props) => <PolicyDetailsOverview {...props} />
  }
}


