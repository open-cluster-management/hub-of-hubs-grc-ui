/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* Copyright (c) 2020 Red Hat, Inc. */
'use strict'

import React from 'react'
import { Gallery, GalleryItem, Text, TextContent, TextVariants } from '@patternfly/react-core'
import config from '../../server/lib/shared/config'
import msgs from '../nls/platform.properties'

import '../scss/welcome.scss'

export default class WelcomeStatic extends React.Component {

  constructor(props) {
    super(props)
  }

  welcomeCard(img, title, desc, linkText, linkRoute) {
		return (
			<div className="welcome--svcs-container">
				<div className="welcome--svcs-container-img">
					<img
						src={`${config.contextPath}/graphics/${img}`}
						alt={''}
					/>
				</div>
				<div className="welcome--svcs-container-text">
					<TextContent>
						<Text className={'welcome--svcs-container-text-title'} style={{ marginBottom: 0 }} component={TextVariants.h3}>{title}</Text>
						<Text
							className={'welcome--svcs-container-text-title-link'}
							component={TextVariants.a}
							href={linkRoute}
						>
							{linkText}
						</Text>
					</TextContent>
          <Text className={'welcome--svcs-container-text-desc'} component={TextVariants.p}>{desc}</Text>
				</div>
			</div>
		)
	}

  render() {
    const { locale } = this.context
    const welcomeBoxLinkStr = 'welcome.connect.box.link'
    const welcomeBoxLabelStr = 'welcome.connect.label'
    return (
      <div className={'welcome'}>
        <div className='welcome--introduction' role='region' aria-label={msgs.get('welcome.label', locale)}>
          <div className='welcome--introduction__description'>
            <TextContent className={'welcome--text'}>
              <Text component={TextVariants.h1}>{msgs.get('welcome.acm', locale)}</Text>
              <Text component={TextVariants.p}>{msgs.get('welcome.paragraph.description', locale)}</Text>
            </TextContent>
            <div className='welcome--image'>
              <img
                width="32px"
                height="32px"
                src={`${config.contextPath}/graphics/Welcome-page-header.png`}
                alt={msgs.get('svg.description.welcome', locale)} />
            </div>
          </div>
        </div>
        <div className='welcome--svcs' role='region' aria-label={msgs.get(welcomeBoxLabelStr, locale)} >
          <Gallery
            className='welcome--svcs-gallery-container'
            hasGutter
            minWidths={{
              md: '70%',
              lg: '70%',
              xl: '70%',
              '2xl': '70%'
            }}
            maxWidths={{
              md: '70%',
              lg: '70%',
              xl: '70%',
              '2xl': '70%'
            }} >
            <GalleryItem>
              {this.welcomeCard(
                'welcome-card-2-icon.svg',
                msgs.get('welcome.card.two.title', locale),
                msgs.get('welcome.card.two.desc', locale),
                msgs.get('welcome.card.two.link', locale),
                '/multicloud/clusters'
              )}
            </GalleryItem>
            <GalleryItem>
              {this.welcomeCard(
                'welcome-card-4-icon.svg',
                msgs.get('welcome.card.four.title', locale),
                msgs.get('welcome.card.four.desc', locale),
                msgs.get('welcome.card.four.link', locale),
                '/multicloud/policies'
              )}
            </GalleryItem>
          </Gallery>
        </div>
        <div className='welcome--info' role='region' aria-label={msgs.get(welcomeBoxLabelStr, locale)} >
          <div className='welcome--info__heading'>
              <Text component={TextVariants.h2}>{msgs.get('welcome.information.heading', locale)}</Text>
          </div>
          <div className='welcome--info__details'>
            <div className="welcome--info__details-top">
              <Text component={TextVariants.p}>{msgs.get('welcome.information.top', locale)}</Text>
            </div>
            <div className="welcome--info__details-container">
              <div className="container-row">
                <div className="welcome--info__details-container-item spacer">
                  <Text className="header" component={TextVariants.p}>{msgs.get('welcome.information.items.kubernetes.title', locale)}</Text>
                  <Text className="desc" component={TextVariants.p}>{msgs.get('welcome.information.items.kubernetes.desc', locale)}</Text>
                </div>
                <div className="welcome--info__details-container-item spacer">
                  <Text className="header" component={TextVariants.p}>{msgs.get('welcome.information.items.policies.title', locale)}</Text>
                  <Text className="desc" component={TextVariants.p}>{msgs.get('welcome.information.items.policies.desc', locale)}</Text>
                </div>
                <div className="welcome--info__details-container-item">
                  <Text className="header" component={TextVariants.p}>{msgs.get('welcome.information.items.landscape.title', locale)}</Text>
                  <Text className="desc" component={TextVariants.p}>{msgs.get('welcome.information.items.landscape.desc', locale)}</Text>
                </div>
              </div>
              <div className="container-row">
                <div className="welcome--info__details-container-item spacer">
                  <Text className="header" component={TextVariants.p}>{msgs.get('welcome.information.items.envs.title', locale)}</Text>
                  <Text className="desc" component={TextVariants.p}>{msgs.get('welcome.information.items.envs.desc', locale)}</Text>
                </div>
                <div className="welcome--info__details-container-item spacer">
                  <Text className="header" component={TextVariants.p}>{msgs.get('welcome.information.items.integration.title', locale)}</Text>
                  <Text className="desc" component={TextVariants.p}>{msgs.get('welcome.information.items.integration.desc', locale)}</Text>
                </div>
                <div className="welcome--info__details-container-item">
                  <Text className="header" component={TextVariants.p}>{msgs.get('welcome.information.items.alerts.title', locale)}</Text>
                  <Text className="desc" component={TextVariants.p}>{msgs.get('welcome.information.items.alerts.desc', locale)}</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='welcome--connect' role='region' aria-label={msgs.get(welcomeBoxLabelStr, locale)} >
          <div className='welcome--connect__heading'>
            <Text component={TextVariants.h2}>{msgs.get('welcome.connect.heading', locale)}</Text>
          </div>
          <div className='welcome--connect__details'>
            <div className='welcome--connect__section'>
              <img
                className='welcome--img'
                src={`${config.contextPath}/graphics/welcome-community-icon.svg`}
                alt={msgs.get('svg.description.blog', locale)} />
              <Text className="welcome--connect__section-title" component={TextVariants.p}>{msgs.get('welcome.connect.box.one.title.one', locale)}</Text>
              <Text className="welcome--connect__section-body" component={TextVariants.p}>{msgs.get('welcome.connect.box.one.title.two', locale)}</Text>
              <Text className="welcome--link" target='dev-community' component={TextVariants.a} href='https://www.redhat.com/en/blog/products'>{msgs.get(welcomeBoxLinkStr, locale)}
                <img
                  className='welcome--connect__section-launch'
                  src={`${config.contextPath}/graphics/arrow-right.svg`}
                  alt={msgs.get(welcomeBoxLinkStr, locale)} />
              </Text>
            </div>
            <div className='welcome--connect__section'>
              <img
                className='welcome--img'
                src={`${config.contextPath}/graphics/welcome-slack-icon.svg`}
                alt={msgs.get('svg.description.slack', locale)} />
              <Text className="welcome--connect__section-title" component={TextVariants.p}>{msgs.get('welcome.connect.box.two.title.one', locale)}</Text>
              <Text className="welcome--connect__section-body" component={TextVariants.p}>{msgs.get('welcome.connect.box.two.title.two', locale)}</Text>
              <Text className="connect-coming-soon" component={TextVariants.p}>{msgs.get('welcome.connect.box.coming.soon')}</Text>
            </div>
            <div className='welcome--connect__section'>
              <img
                className='welcome--img'
                src={`${config.contextPath}/graphics/welcome-support-icon.svg`}
                alt={msgs.get('svg.description.support', locale)}
              />
              <Text className="welcome--connect__section-title" component={TextVariants.p}>{msgs.get('welcome.connect.box.three.title.one', locale)}</Text>
              <Text className="welcome--connect__section-body" component={TextVariants.p}>{msgs.get('welcome.connect.box.three.title.two', locale)}</Text>
              <Text className="welcome--connect__section-body" style={{ marginTop: 0 }} component={TextVariants.p}>{msgs.get('welcome.connect.box.three.title.three', locale)}</Text>
              <Text className="welcome--link" target='support' component={TextVariants.a} href='https://access.redhat.com/support'>{msgs.get(welcomeBoxLinkStr, locale)}
                <img
                  className='welcome--connect__section-launch'
                  src={`${config.contextPath}/graphics/arrow-right.svg`}
                  alt={msgs.get(welcomeBoxLinkStr, locale)} />
              </Text>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
