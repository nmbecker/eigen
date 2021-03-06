import { Flex, Sans } from "@artsy/palette"
import { FairsRail_fairsModule } from "__generated__/FairsRail_fairsModule.graphql"
import ImageView from "lib/Components/OpaqueImageView/OpaqueImageView"
import { SectionTitle } from "lib/Components/SectionTitle"
import Switchboard from "lib/NativeModules/SwitchBoard"
import React, { Component } from "react"
import { View } from "react-native"
import { createFragmentContainer, graphql } from "react-relay"

import {
  CARD_RAIL_ARTWORKS_HEIGHT as ARTWORKS_HEIGHT,
  CardRailArtworkImageContainer as ArtworkImageContainer,
  CardRailCard,
  CardRailDivision as Division,
  CardRailMetadataContainer as MetadataContainer,
} from "lib/Components/Home/CardRailCard"
import { CardRailFlatList } from "lib/Components/Home/CardRailFlatList"
import { concat, take } from "lodash"

interface Props {
  fairsModule: FairsRail_fairsModule
}

type FairItem = FairsRail_fairsModule["results"][0]

export class FairsRail extends Component<Props, null> {
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
                [result.image.url],
                result.followedArtistArtworks.edges.map(edge => edge.node.image.url),
                result.otherArtworks.edges.map(edge => edge.node.image.url)
              ),
              3
            )
            const location = result.location?.city || result.location?.country
            return (
              <CardRailCard
                key={result.slug}
                onPress={() => Switchboard.presentNavigationViewController(this, `${result.slug}?entity=fair`)}
              >
                <View>
                  <ArtworkImageContainer>
                    <ImageView width={ARTWORKS_HEIGHT} height={ARTWORKS_HEIGHT} imageURL={artworkImageURLs[0]} />
                    <Division />
                    <View>
                      <ImageView
                        width={ARTWORKS_HEIGHT / 2}
                        height={ARTWORKS_HEIGHT / 2}
                        imageURL={artworkImageURLs[1]}
                      />
                      <Division horizontal />
                      <ImageView
                        width={ARTWORKS_HEIGHT / 2}
                        height={ARTWORKS_HEIGHT / 2}
                        imageURL={artworkImageURLs[2]}
                      />
                    </View>
                  </ArtworkImageContainer>
                  <MetadataContainer>
                    <Sans numberOfLines={1} weight="medium" size="3t">
                      {result.name}
                    </Sans>
                    <Sans numberOfLines={1} size="3t" color="black60" data-test-id="card-subtitle">
                      {result.exhibitionPeriod}
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
