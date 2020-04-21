import { Flex, Sans } from "@artsy/palette"
import { FairsRail_fairsModule } from "__generated__/FairsRail_fairsModule.graphql"
import React, { Component } from "react"
import { View } from "react-native"
import { createFragmentContainer, graphql } from "react-relay"
// @ts-ignore STRICTNESS_MIGRATION
import styled from "styled-components/native"

import ImageView from "lib/Components/OpaqueImageView/OpaqueImageView"
import { SectionTitle } from "lib/Components/SectionTitle"
import Switchboard from "lib/NativeModules/SwitchBoard"

import { CardRailCard } from "lib/Components/Home/CardRailCard"
import { CardRailFlatList } from "lib/Components/Home/CardRailFlatList"
import { concat, take } from "lodash"

const ARTWORKS_HEIGHT = 180

interface Props {
  fairsModule: FairsRail_fairsModule
}

type FairItem = FairsRail_fairsModule["results"][0]

export class FairsRail extends Component<Props> {
  render() {
    return (
      <View>
        <Flex pl="2" pr="2">
          <SectionTitle title="Featured Fairs" subtitle="See exclusive works in top art fairs" />
        </Flex>

        <CardRailFlatList<FairItem>
          data={this.props.fairsModule.results}
          renderItem={({ item: result }) => {
            // Fairs are expected to always have >= 2 artworks and a hero image.
            // We can make assumptions about this in UI layout, but should still
            // be cautious to avoid crashes if this assumption is broken.
            const artworkImageURLs = take(
              concat(
                // @ts-ignore STRICTNESS_MIGRATION
                [result.image.url],
                // @ts-ignore STRICTNESS_MIGRATION
                result.followedArtistArtworks.edges.map(edge => edge.node.image.url),
                // @ts-ignore STRICTNESS_MIGRATION
                result.otherArtworks.edges.map(edge => edge.node.image.url)
              ),
              3
            )
            // @ts-ignore STRICTNESS_MIGRATION
            const location = result.location?.city || result.location?.country
            return (
              <CardRailCard
                // @ts-ignore STRICTNESS_MIGRATION
                key={result.slug}
                // @ts-ignore STRICTNESS_MIGRATION
                onPress={() => Switchboard.presentNavigationViewController(this, `${result.slug}?entity=fair`)}
              >
                <View>
                  <ArtworkImageContainer>
                    <ImageView
                      width={ARTWORKS_HEIGHT}
                      height={ARTWORKS_HEIGHT}
                      // @ts-ignore STRICTNESS_MIGRATION
                      imageURL={artworkImageURLs[0]}
                    />
                    <Division />
                    <View>
                      <ImageView
                        width={ARTWORKS_HEIGHT / 2}
                        height={ARTWORKS_HEIGHT / 2}
                        // @ts-ignore STRICTNESS_MIGRATION
                        imageURL={artworkImageURLs[1]}
                      />
                      <Division horizontal />
                      <ImageView
                        width={ARTWORKS_HEIGHT / 2}
                        height={ARTWORKS_HEIGHT / 2}
                        // @ts-ignore STRICTNESS_MIGRATION
                        imageURL={artworkImageURLs[2]}
                      />
                    </View>
                  </ArtworkImageContainer>
                  <MetadataContainer>
                    <Sans numberOfLines={1} weight="medium" size="3t">
                      {
                        // @ts-ignore STRICTNESS_MIGRATION
                        result.name
                      }
                    </Sans>
                    <Sans numberOfLines={1} size="3t" color="black60" data-test-id="card-subtitle">
                      {
                        // @ts-ignore STRICTNESS_MIGRATION
                        result.exhibitionPeriod
                      }
                      {Boolean(location) && `  •  ${location}`}
                    </Sans>
                  </MetadataContainer>
                </View>
              </CardRailCard>
            )
          }}
        />
      </View>
    )
  }
}

// Default is a vertical division
export const Division = styled.View<{ horizontal?: boolean }>`
  border: 1px solid white;
  ${({ horizontal }: any /* STRICTNESS_MIGRATION */) => (horizontal ? "height" : "width")}: 1px;
`

const ArtworkImageContainer = styled.View`
  width: 100%;
  height: ${ARTWORKS_HEIGHT}px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  overflow: hidden;
`

const MetadataContainer = styled.View`
  /* 13px on bottom helps the margin feel visually consistent around all sides */
  margin: 15px 15px 13px;
`

export const FairsRailFragmentContainer = createFragmentContainer(FairsRail, {
  fairsModule: graphql`
    fragment FairsRail_fairsModule on HomePageFairsModule {
      results {
        id
        slug
        profile {
          slug
        }
        name
        exhibitionPeriod
        image {
          url(version: "large")
        }
        location {
          city
          country
        }
        followedArtistArtworks: filterArtworksConnection(first: 2, includeArtworksByFollowedArtists: true) {
          edges {
            node {
              image {
                url(version: "large")
              }
            }
          }
        }
        otherArtworks: filterArtworksConnection(first: 2) {
          edges {
            node {
              image {
                url(version: "large")
              }
            }
          }
        }
      }
    }
  `,
})
