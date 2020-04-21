import { Theme } from "@artsy/palette"
import { InfiniteScrollArtworksGridContainer as InfiniteScrollArtworksGrid } from "lib/Components/ArtworkGrids/InfiniteScrollArtworksGrid"
import {
  CollectionFixture,
  ZeroStateCollectionFixture,
} from "lib/Scenes/Collection/Components/__fixtures__/CollectionFixture"
import { filterArtworksParams } from "lib/Scenes/Collection/Helpers/FilterArtworksHelpers"
import { CollectionArtworksFragmentContainer as CollectionArtworks } from "lib/Scenes/Collection/Screens/CollectionArtworks"
import { renderRelayTree } from "lib/tests/renderRelayTree"
import { FilterArray } from "lib/utils/ArtworkFiltersStore"
import { ArtworkFilterContext, ArtworkFilterContextState } from "lib/utils/ArtworkFiltersStore"
import React from "react"
import { graphql } from "react-relay"
import { CollectionZeroState } from "../CollectionZeroState"

let state: ArtworkFilterContextState

jest.unmock("react-relay")

beforeEach(() => {
  state = {
    selectedFilters: [],
    appliedFilters: [],
    previouslyAppliedFilters: [],
    applyFilters: false,
  }
})

// @ts-ignore STRICTNESS_MIGRATION
const getWrapper = async marketingCollection => {
  return await renderRelayTree({
    Component: () => {
      return (
        <Theme>
          <ArtworkFilterContext.Provider
            value={{
              state,
              // @ts-ignore STRICTNESS_MIGRATION
              dispatch: null,
            }}
          >
            <CollectionArtworks collection={{ ...marketingCollection }} />
          </ArtworkFilterContext.Provider>
        </Theme>
      )
    },
    query: graphql`
      query CollectionArtworksTestsQuery @raw_response_type {
        marketingCollection(slug: "street-art-now") {
          ...CollectionArtworks_collection
        }
      }
    `,
    mockData: { marketingCollection },
  })
}

describe("CollectionArtworks", () => {
  it("returns zero state component when there are no artworks to display", async () => {
    const wrapper = await getWrapper(ZeroStateCollectionFixture)

    expect(wrapper.find(CollectionZeroState)).toHaveLength(1)
    expect(wrapper.text()).toContain("Unfortunately, there are no works that meet your criteria.")
  })

  it("returns artworks", async () => {
    const wrapper = await getWrapper(CollectionFixture)

    expect(wrapper.find(InfiniteScrollArtworksGrid)).toHaveLength(1)
  })
})

describe("filterArtworksParams", () => {
  it("returns the default", () => {
    // @ts-ignore STRICTNESS_MIGRATION
    const appliedFilters = []
    // @ts-ignore STRICTNESS_MIGRATION
    expect(filterArtworksParams(appliedFilters)).toEqual({ sort: "-decayed_merch", medium: "*" })
  })

  it("returns the value of appliedFilter", () => {
    const appliedFilters: FilterArray = [{ filterType: "sort", value: "Recently added" }]
    expect(filterArtworksParams(appliedFilters)).toEqual({ sort: "-published_at", medium: "*" })
  })
})
