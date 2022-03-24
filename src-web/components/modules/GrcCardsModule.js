/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* Copyright (c) 2020 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */

'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {
  Accordion, AccordionItem, AccordionToggle, AccordionContent,
  Dropdown, DropdownToggle, DropdownItem,
  Divider, Label
} from '@patternfly/react-core'
import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon'
import msgs from '../../nls/platform.properties'
import _ from 'lodash'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import NoResource from '../common/NoResource'
import TruncateText from '../common/TruncateText'

import '../../scss/module-grc-cards.scss'

const GrcCardsSelections = Object.freeze({
  categories: 0,
  standards: 1,
  controls: 2,
})

export class GrcCardsModule extends React.Component {

  constructor (props) {
    super(props)
    const {viewState: {grcCardChoice=GrcCardsSelections.standards}} = props
    this.state = {
      grcCardChoice: grcCardChoice,
      isDropdownOpen: false
    }
    this.collapseClick = this.collapseClick.bind(this)
    this.onDropdownToggle = this.onDropdownToggle.bind(this)
    this.onDropdownSelect = this.onDropdownSelect.bind(this)
    this.onDropdownFocus = this.onDropdownFocus.bind(this)
  }

  render() {
    const { displayType, showGrcCard } = this.props
    const { locale } = this.context
    const title = msgs.get('overview.grc.overview.title', locale)
    const choices = this.getPolicyCardChoices(locale)
    let cardData
    switch(displayType) {
    case 'all':
    default:
      cardData = this.getPolicyCardData()
      break
    }
    return (
      <div className='module-grc-cards'>
        <Accordion className='accordion-header'>
          <AccordionItem>
            <AccordionToggle
              className='header-container'
              id={`${title.toLowerCase().replace(/ /g,'-')}-toggle`}
              onClick={this.collapseClick}
              isExpanded={showGrcCard}
            >
              <div className='header-title'>
                {title}
                <Label className='grc-cards-count'>{cardData.length}</Label>
              </div>
            </AccordionToggle>
            {showGrcCard && this.renderDropdown(choices)}
            <AccordionContent
              className='grc-cards-container'
              isHidden={!showGrcCard}
            >
              {this.renderCards(cardData, displayType)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  }

  renderDropdown(choices) {
    const { isDropdownOpen, grcCardChoice } = this.state
    return (
      <div className='header-options'>
        <div className='header-divider'>
          <Divider isVertical />
        </div>
        <Dropdown
          onSelect={this.onDropdownSelect}
          toggle={
            <DropdownToggle id='grc-cards-toggle' onToggle={this.onDropdownToggle} toggleIndicator={CaretDownIcon}>
              {choices[grcCardChoice].label}
            </DropdownToggle>
          }
          isOpen={isDropdownOpen}
          isPlain
          dropdownItems={
            choices.map(choice => {
              return (<DropdownItem key={`${choice.label}-dropdownitem`} tabIndex={choice.value}>{choice.label}</DropdownItem>)
            })
          }
        />
      </div>)
  }

  renderCards(cardData, displayType) {
    const { locale } = this.context
    const { handleDrillDownClick } = this.props
    return (cardData.map((data) => {
      let renderCard
      switch(displayType) {
      case 'all':
      default:
        renderCard = <PolicyCard key={data.name} data={data} locale={locale} handleClick={handleDrillDownClick} />
        break
      }
      return renderCard
    }))
  }

  filterOutPolicies = (policies) => {
    const fromHubManagement = window?.localStorage?.getItem('isInfrastructureOpen') === 'true'
    const policyData = []
    if (Array.isArray(policies) && policies.length > 0) {
      policies.forEach((policy) => {
        const localPolicy = policy?.metadata?.annotations['hub-of-hubs.open-cluster-management.io/local-policy']
        if (fromHubManagement && localPolicy == '' || !fromHubManagement && localPolicy === undefined) {
          policyData.push(policy)
        }
      })
    }
    return policyData
  }

  getPolicyCardData = () => {
    const { locale } = this.context
    const { grcItems, activeFilters } = this.props
    const { grcCardChoice } = this.state
    const other = msgs.get('overview.grc.overview.other', locale)
    const grcPolices = this.filterOutPolicies(grcItems)

    // loop thru grcPolices under policies display
    const dataMap = {}
    const policyMap = {}
    const clusterMap = {}
    grcPolices.map(policy => {
      // get a policy's standards/categories
      let types, key
      const annotations = _.get(policy, 'metadata.annotations', {}) || {}
      switch (grcCardChoice) {
      case GrcCardsSelections.categories:
      default:
        types = annotations['policy.open-cluster-management.io/categories'] || ''
        key = 'categories'
        break
      case GrcCardsSelections.standards:
        types = annotations['policy.open-cluster-management.io/standards'] || ''
        key = 'standards'
        break
      }
      // backward compatible and if user doesn't supply an annotation
      if (types && types.length===0) {
        types=other
      }
      //for policies, multi categories/standards is a string split with ','
      types.split(',').forEach(type=>{
        type = type.trim()
        if (type) {
          const name = type
          const filtered = activeFilters[key] &&  activeFilters[key].size>0 && !activeFilters[key].has(name)
          if (!filtered) {
            if (!dataMap[name]) {
              dataMap[name] = {
                name,
                rawName: type,
                choice: key,
                violations: 0,
                counts: {
                  cluster: {
                    violations:0,
                    total:0,
                  },
                  policy: {
                    violations:0,
                    total:0,
                  },
                }
              }
            }

            // if policy has violation
            policyMap[name] = policyMap[name] || {}
            clusterMap[name] = clusterMap[name] || {}
            const statuses = _.get(policy, 'raw.status.status', {})
            const policyName = _.get(policy, 'metadata.name')
            Object.keys(statuses).forEach(clusterName=>{
              const compliant = statuses[clusterName].compliant
              const noncompliant = !compliant || compliant.toLowerCase()==='noncompliant'
              policyMap[name][policyName] = policyMap[name][policyName] || noncompliant
              clusterMap[name][clusterName] = clusterMap[name][clusterName] || noncompliant
            })
          }
        }
      })
    })

    // tabulate for category or standard
    // by policies
    Object.keys(policyMap).forEach(name=>{
      const data = dataMap[name]
      const policies = policyMap[name]
      Object.keys(policies).forEach(policy=>{

        // this is a policy with this category/standard
        data.counts.policy.total++

        // this policy with this category/standard has a violation
        if (policies[policy]) {
          data.counts.policy.violations++
          data.violations++
        }
      })
    })

    // by clusters
    Object.keys(clusterMap).forEach(name=>{
      const data = dataMap[name]
      const clusters = clusterMap[name]
      Object.keys(clusters).forEach(cluster=>{

        // this is a cluster with this category/standard
        data.counts.cluster.total++

        // this cluster with this category/standard has a violation
        if (clusters[cluster]) {
          data.counts.cluster.violations++
          data.violations++
        }
      })
    })

    // convert to array and sort
    return Object.keys(dataMap).map(key=>{
      return {...dataMap[key]}
    }).sort(({name:an, violations:av}, {name:bn, violations:bv})=>{
      const v = bv-av
      if (v===0) {
        if (an===other && bn!==other) {
          return 1
        } else  if (an!==other && bn===other) {
          return -1
        }
        return an.localeCompare(bn)
      }
      return v
    })
  }

  getPolicyCardChoices = (locale) => {
    if (!this.grcCardChoices) {
      this.grcCardChoices = [
        {
          value: GrcCardsSelections.categories,
          label: msgs.get('overview.grc.cards.categories', locale),
        },
        {
          value: GrcCardsSelections.standards,
          label: msgs.get('overview.grc.cards.standards', locale),
        },
      ]
    }
    return this.grcCardChoices
  }

  onDropdownToggle = (isDropdownOpen) => {
    this.setState({
      isDropdownOpen
    })
  }

  onDropdownSelect = (event) => {
    const value = event.target.tabIndex
    this.props.updateViewState({grcCardChoice: value})
    this.setState((prevState) => ({
      isDropdownOpen: !prevState.isDropdownOpen,
      grcCardChoice: value
    }))
    this.onDropdownFocus()
  }

  onDropdownFocus = () => {
    const element = document.getElementById('grc-cards-toggle')
    if (element) {
      element.focus()
    }
  }

  collapseClick() {
    const {history, location} = this.props
    const paraURL = queryString.parse(location.search)
    if(typeof paraURL.card === 'undefined'){//when no card flag means true
      paraURL.card = false}
    else{
      paraURL.card = paraURL.card === 'false' ? true : false}
    history.push(`${location.pathname}?${queryString.stringify(paraURL)}`)
    return queryString.stringify(paraURL)
  }
}

// functional policy card component
const PolicyCard = ({data, locale, handleClick}) => {
  const { counts, choice, name } = data
  //validItemsCount = 0 means there isn't any policy and cluster violation for single policy card
  //thus return policy empty state card, otherwise return normal policy card
  let validItemsCount = 0
  const countData = Object.keys(counts).map(type=>{
    validItemsCount += counts[type].violations ? counts[type].violations : 0
    return {
      ...counts[type],
      grcType: msgs.get(`overview.${type}.violations`, locale),
      choice,
      type,
    }
  })
  return (
    <div key={name}>
      <div className='card-container'>
        <div className='card-content'>
          <div className='card-name'>
            <TruncateText maxCharacters={50} text={name} />
          </div>
          <div className='card-count-content'>
            { //normal policy card with at least one policy or cluster violation
              validItemsCount > 0 && countData.map(({violations, total, grcType, choice:localChoice, type }) => {
                const violated = violations > 0
                const containerClasses = classNames({
                  'card-count-container': true,
                  violated,
                })
                const onClick = () =>{
                  if (violated) {
                    handleClick(localChoice, name, type)
                  }
                }
                const onKeyPress = (e) =>{
                  if ( e.key === 'Enter') {
                    onClick()
                  }
                }
                return (
                  <div key={grcType} className={containerClasses} role={'button'}
                    tabIndex={violated ? 0 : -1} onClick={onClick} onKeyPress={onKeyPress} >
                    <div className='card-count'>
                      <div className='card-count-informations'>
                        {violations}
                      </div>
                      <div className='card-count-total'>
                        {`/${total}`}
                      </div>
                    </div>
                    <div className='card-grc-type'>
                      {grcType}
                    </div>
                  </div>
                )
              })}
            { //policy empty state card without any policy and cluster violation
              validItemsCount === 0 &&
              <div className='empty-violations-strip'>
                <NoResource
                  className={'card-violations empty'}
                  imgClassName={'empty-violations-img'}
                  titleClassName={'no-card-violations'}
                  title={msgs.get('overview.violations.empty', locale)}
                  detail={msgs.get('overview.violations.empty.detail', locale)}
                  svgName={'NoViolation-illus.svg'}>
                </NoResource>
              </div>}
          </div>
        </div>
      </div>
    </div>
  )
}

PolicyCard.propTypes = {
  data: PropTypes.object,
  handleClick: PropTypes.func,
  locale: PropTypes.string
}

GrcCardsModule.propTypes = {
  activeFilters: PropTypes.object,
  displayType: PropTypes.string,
  grcItems: PropTypes.array,
  handleDrillDownClick: PropTypes.func,
  history: PropTypes.object,
  location: PropTypes.object,
  showGrcCard: PropTypes.bool,
  updateViewState: PropTypes.func,
  viewState: PropTypes.object,
}

export default withRouter(GrcCardsModule)
