import { Box, color, FilterIcon, Flex, Sans, Separator, Spacer, Theme } from "@artsy/palette"
import { CollectionQuery } from "__generated__/CollectionQuery.graphql"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import renderWithLoadProgress from "lib/utils/renderWithLoadProgress"
import React, { Component } from "react"
import { Dimensions, FlatList, NativeModules, TouchableWithoutFeedback, View } from "react-native"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"
// @ts-ignore STRICTNESS_MIGRATION
import styled from "styled-components/native"
import { Collection_collection } from "../../../__generated__/Collection_collection.graphql"
import { FilterModalNavigator } from "../../../lib/Components/FilterModal"
import { CollectionArtworksFragmentContainer as CollectionArtworks } from "../../../lib/Scenes/Collection/Screens/CollectionArtworks"
import { CollectionHeaderContainer as CollectionHeader } from "../../../lib/Scenes/Collection/Screens/CollectionHeader"
import { Schema, screenTrack } from "../../../lib/utils/track"
import { ArtworkFilterContext, ArtworkFilterGlobalStateProvider } from "../../utils/ArtworkFiltersStore"
import { CollectionFeaturedArtistsContainer as CollectionFeaturedArtists } from "./Components/FeaturedArtists"

interface CollectionProps {
  collection: Collection_collection
}

interface CollectionState {
  sections: Array<{ type: string; data: any }>
  isArtworkGridVisible: boolean
  isFilterArtworksModalVisible: boolean
}

@screenTrack((props: CollectionProps) => ({
  context_screen: Schema.PageNames.Collection,
  context_screen_owner_slug: props.collection.slug,
  context_screen_owner_id: props.collection.id,
  context_screen_owner_type: Schema.OwnerEntityTypes.Collection,
}))
export class Collection extends Component<CollectionProps, CollectionState> {
  state = {
    sections: [],
    isArtworkGridVisible: false,
    isFilterArtworksModalVisible: false,
  }
  viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 75, // What percentage of the artworks component should be in the screen before toggling the filter button
  }
  componentDidMount() {
    const sections = []

    sections.push({
      type: "collectionFeaturedArtists",
      data: {
        artists: [],
      },
    })

    sections.push({
      type: "collectionArtworks",
      data: {
        artworks: [],
      },
    })

    this.setState({
      sections,
    })
  }

  // @ts-ignore STRICTNESS_MIGRATION
  renderItem = ({ item: { type } }) => {
    switch (type) {
      case "collectionFeaturedArtists":
        return (
          <Box>
            <CollectionFeaturedArtists collection={this.props.collection} />
            <Spacer mb={1} />
            <Separator />
          </Box>
        )
      case "collectionArtworks":
        return (
          <>
            <CollectionArtworks collection={this.props.collection} />
            <FilterModalNavigator
              {...this.props}
              isFilterArtworksModalVisible={this.state.isFilterArtworksModalVisible}
              exitModal={this.handleFilterArtworksModal.bind(this)}
              closeModal={this.closeFilterArtworksModal.bind(this)}
            />
          </>
        )
      default:
        return null
    }
  }

  // @ts-ignore STRICTNESS_MIGRATION
  onViewableItemsChanged = ({ viewableItems }) => {
    // @ts-ignore STRICTNESS_MIGRATION
    ;(viewableItems || []).map(viewableItem => {
      const artworksRenderItem = viewableItem?.item?.type || ""
      const artworksRenderItemViewable = viewableItem?.isViewable || false

      if (artworksRenderItem === "collectionArtworks" && artworksRenderItemViewable) {
        return this.setState(_prevState => ({ isArtworkGridVisible: true }))
      }

      return this.setState(_prevState => ({ isArtworkGridVisible: false }))
    })
  }

  handleFilterArtworksModal() {
    this.setState(_prevState => {
      return { isFilterArtworksModalVisible: !_prevState.isFilterArtworksModalVisible }
    })
  }

  @screenTrack((props: CollectionProps) => ({
    action_name: "filter",
    context_screen_owner_type: Schema.OwnerEntityTypes.Collection,
    context_screen: Schema.PageNames.Collection,
    context_screen_owner_id: props.collection.id,
    context_screen_owner_slug: props.collection.slug,
    action_type: Schema.ActionTypes.Tap,
  }))
  openFilterArtworksModal() {
    this.handleFilterArtworksModal()
  }

  @screenTrack((props: CollectionProps) => ({
    action_name: "closeFilterWindow",
    context_screen_owner_type: Schema.OwnerEntityTypes.Collection,
    context_screen: Schema.PageNames.Collection,
    context_screen_owner_id: props.collection.id,
    context_screen_owner_slug: props.collection.slug,
    action_type: Schema.ActionTypes.Tap,
  }))
  closeFilterArtworksModal() {
    this.handleFilterArtworksModal()
  }

  render() {
    const { isArtworkGridVisible, sections } = this.state
    const isArtworkFilterEnabled = NativeModules.Emission?.options?.AROptionsFilterCollectionsArtworks
    return (
      <ArtworkFilterGlobalStateProvider>
        <ArtworkFilterContext.Consumer>
          {value => {
            return (
              <Theme>
                <View style={{ flex: 1 }}>
                  <FlatList
                    onViewableItemsChanged={this.onViewableItemsChanged}
                    viewabilityConfig={this.viewabilityConfig}
                    keyExtractor={(_item, index) => String(index)}
                    data={sections}
                    ListHeaderComponent={<CollectionHeader collection={this.props.collection} />}
                    renderItem={item => (
                      <Box px={2} pb={2}>
                        {this.renderItem(item)}
                      </Box>
                    )}
                  />
                  {isArtworkGridVisible && isArtworkFilterEnabled && (
                    <FilterArtworkButtonContainer>
                      <TouchableWithoutFeedback onPress={this.openFilterArtworksModal.bind(this)}>
                        <FilterArtworkButton
                          px="2"
                          isFilterCountVisible={value.state.appliedFilters.length > 0 ? true : false}
                        >
                          <FilterIcon fill="white100" />
                          <Sans size="3t" pl="1" py="1" color="white100" weight="medium">
                            Filter
                          </Sans>
                          {value.state.appliedFilters.length > 0 && (
                            <>
                              <Sans size="3t" pl={0.5} py="1" color="white100" weight="medium">
                                {"\u2022"}
                              </Sans>
                              <Sans size="3t" pl={0.5} py="1" color="white100" weight="medium">
                                {value.state.appliedFilters.length}
                              </Sans>
                            </>
                          )}
                        </FilterArtworkButton>
                      </TouchableWithoutFeedback>
                    </FilterArtworkButtonContainer>
                  )}
                </View>
              </Theme>
            )
          }}
        </ArtworkFilterContext.Consumer>
      </ArtworkFilterGlobalStateProvider>
    )
  }
}

export const FilterArtworkButtonContainer = styled(Flex)`
  position: absolute;
  bottom: 20;
  flex: 1;
  justify-content: center;
  width: 100%;
  flex-direction: row;
`

export const FilterArtworkButton = styled(Flex)<{ isFilterCountVisible: boolean }>`
  border-radius: 20;
  background-color: ${color("black100")};
  align-items: center;
  justify-content: center;
  flex-direction: row;
`

export const CollectionContainer = createFragmentContainer(Collection, {
  collection: graphql`
    fragment Collection_collection on MarketingCollection
      @argumentDefinitions(screenWidth: { type: "Int", defaultValue: 500 }) {
      id
      slug
      ...CollectionHeader_collection
      ...CollectionArtworks_collection
      ...FeaturedArtists_collection
    }
  `,
})

interface CollectionRendererProps {
  collectionID: string
}

export const CollectionRenderer: React.SFC<CollectionRendererProps> = ({ collectionID }) => (
  <QueryRenderer<CollectionQuery>
    environment={defaultEnvironment}
    query={graphql`
      query CollectionQuery($collectionID: String!, $screenWidth: Int) {
        collection: marketingCollection(slug: $collectionID) {
          ...Collection_collection @arguments(screenWidth: $screenWidth)
        }
      }
    `}
    variables={{
      collectionID,
      screenWidth: Dimensions.get("screen").width,
    }}
    cacheConfig={{
      // Bypass Relay cache on retries.
      force: true,
    }}
    render={renderWithLoadProgress(CollectionContainer)}
  />
)
