import { Sans, Theme } from "@artsy/palette"
// @ts-ignore STRICTNESS_MIGRATION
import { mount } from "enzyme"
import { CollectionFixture } from "lib/Scenes/Collection/Components/__fixtures__/CollectionFixture"
import { CollectionArtworks } from "lib/Scenes/Collection/Screens/CollectionArtworks"
import { renderRelayTree } from "lib/tests/renderRelayTree"
import React from "react"
import { NativeModules } from "react-native"
import { graphql, RelayPaginationProp } from "react-relay"
import { act, create } from "react-test-renderer"
import * as renderer from "react-test-renderer"
import { useTracking } from "react-tracking"
import { ArrowLeftIconContainer } from "../../../lib/Components/ArtworkFilterOptions/SortOptions"
import { FakeNavigator as MockNavigator } from "../../../lib/Components/Bidding/__tests__/Helpers/FakeNavigator"
import {
  ApplyButton,
  ClearAllButton,
  CloseIconContainer,
  CurrentOption,
  FilterModalNavigator,
  FilterOptions,
  TouchableOptionListItemRow,
} from "../../../lib/Components/FilterModal"
import { ArtworkFilterContext, ArtworkFilterContextState, reducer } from "../../utils/ArtworkFiltersStore"

let mockNavigator: MockNavigator
let state: ArtworkFilterContextState
const closeModalMock = jest.fn()
const exitModalMock = jest.fn()
const trackEvent = jest.fn()

jest.unmock("react-relay")

beforeEach(() => {
  ;(useTracking as jest.Mock).mockImplementation(() => {
    return {
      trackEvent,
    }
  })
  mockNavigator = new MockNavigator()
  state = {
    selectedFilters: [],
    appliedFilters: [],
    previouslyAppliedFilters: [],
    applyFilters: false,
  }
  NativeModules.Emission.options.AROptionsFilterCollectionsArtworks = true
})

afterEach(() => {
  jest.resetAllMocks()
})

// @ts-ignore STRICTNESS_MIGRATION
const MockFilterModalNavigator = ({ initialState }) => {
  const [filterState, dispatch] = React.useReducer(reducer, initialState)

  return (
    <Theme>
      <ArtworkFilterContext.Provider
        value={{
          state: filterState,
          dispatch,
        }}
      >
        <FilterModalNavigator
          // @ts-ignore STRICTNESS_MIGRATION
          collection={CollectionFixture}
          exitModal={exitModalMock}
          closeModal={closeModalMock}
          isFilterArtworksModalVisible
        />
      </ArtworkFilterContext.Provider>
    </Theme>
  )
}

// @ts-ignore STRICTNESS_MIGRATION
const MockFilterScreen = ({ initialState }) => {
  const [filterState, dispatch] = React.useReducer(reducer, initialState)

  return (
    <Theme>
      <ArtworkFilterContext.Provider
        value={{
          state: filterState,
          dispatch,
        }}
      >
        <FilterOptions id="id" slug="slug" closeModal={closeModalMock} navigator={mockNavigator as any} />
      </ArtworkFilterContext.Provider>
    </Theme>
  )
}

describe("Filter modal navigation flow", () => {
  it("allows users to navigate forward to sort screen from filter screen", () => {
    const filterScreen = create(
      <Theme>
        <ArtworkFilterContext.Provider
          value={{
            state,
            // @ts-ignore STRICTNESS_MIGRATION
            dispatch: null,
          }}
        >
          <FilterOptions id="id" slug="slug" closeModal={jest.fn()} navigator={mockNavigator as any} />
        </ArtworkFilterContext.Provider>
      </Theme>
    )

    // the first row item takes users to the Medium navigation route
    const instance = filterScreen.root.findAllByType(TouchableOptionListItemRow)[0]

    act(() => instance.props.onPress())

    const nextRoute = mockNavigator.nextRoute()

    const nextScreen = renderer.create(
      <Theme>
        <ArtworkFilterContext.Provider
          value={{
            state,
            // @ts-ignore STRICTNESS_MIGRATION
            dispatch: null,
          }}
        >
          {React.createElement(
            // @ts-ignore STRICTNESS_MIGRATION
            nextRoute.component,
            {
              ...nextRoute.passProps,
              nextScreen: true,
              navigator: MockNavigator,
              relay: {
                environment: null,
              },
            }
          )}
        </ArtworkFilterContext.Provider>
      </Theme>
    )

    // @ts-ignore STRICTNESS_MIGRATION
    const getNextScreenTitle = component => component.root.findByType(Sans).props.children

    expect(getNextScreenTitle(nextScreen)).toEqual("Sort")
  })

  it("allows users to navigate forward to medium screen from filter screen", () => {
    const filterScreen = create(
      <Theme>
        <ArtworkFilterContext.Provider
          value={{
            state,
            // @ts-ignore STRICTNESS_MIGRATION
            dispatch: null,
          }}
        >
          <FilterOptions id="id" slug="slug" closeModal={jest.fn()} navigator={mockNavigator as any} />
        </ArtworkFilterContext.Provider>
      </Theme>
    )

    // the second row item takes users to the Medium navigation route
    const instance = filterScreen.root.findAllByType(TouchableOptionListItemRow)[1]

    act(() => instance.props.onPress())

    const nextRoute = mockNavigator.nextRoute()

    const nextScreen = renderer.create(
      <Theme>
        <ArtworkFilterContext.Provider
          value={{
            state,
            // @ts-ignore STRICTNESS_MIGRATION
            dispatch: null,
          }}
        >
          {React.createElement(
            // @ts-ignore STRICTNESS_MIGRATION
            nextRoute.component,
            {
              ...nextRoute.passProps,
              nextScreen: true,
              navigator: MockNavigator,
              relay: {
                environment: null,
              },
            }
          )}
        </ArtworkFilterContext.Provider>
      </Theme>
    )

    // @ts-ignore STRICTNESS_MIGRATION
    const getNextScreenTitle = component => component.root.findByType(Sans).props.children

    expect(getNextScreenTitle(nextScreen)).toEqual("Medium")
  })

  xit("allows users to navigate back to filter screen from sort screen ", () => {
    const filterScreen = mount(<MockFilterScreen initialState={state} />)

    filterScreen
      .find(TouchableOptionListItemRow)
      .at(0)
      .props()
      .onPress()

    expect(mockNavigator.nextRoute())
    const nextRoute = mockNavigator.nextRoute()
    mockNavigator.pop()

    const sortScreen = mount(
      <Theme>
        <ArtworkFilterContext.Provider
          value={{
            state,
            // @ts-ignore STRICTNESS_MIGRATION
            dispatch: null,
          }}
        >
          {React.createElement(
            // @ts-ignore STRICTNESS_MIGRATION
            nextRoute.component,
            {
              ...nextRoute.passProps,
              nextScreen: true,
              navigator: MockNavigator,
              relay: {
                environment: null,
              },
            }
          )}
        </ArtworkFilterContext.Provider>
      </Theme>
    )

    sortScreen
      .find(ArrowLeftIconContainer)
      .props()
      .onPress()
  })

  it("allows users to exit filter modal screen when selecting close icon", () => {
    const filterScreen = mount(<MockFilterScreen initialState={state} />)

    filterScreen
      .find(CloseIconContainer)
      .props()
      .onPress()
    expect(closeModalMock).toHaveBeenCalled()
  })
})

describe("Filter modal states", () => {
  it("displays the currently selected sort option on the filter screen", () => {
    state = {
      selectedFilters: [{ filterType: "sort", value: "Price (low to high)" }],
      appliedFilters: [],
      previouslyAppliedFilters: [],
      applyFilters: false,
    }

    const filterScreen = mount(<MockFilterScreen initialState={state} />)
    expect(
      filterScreen
        .find(CurrentOption)
        .at(0)
        .text()
    ).toEqual("Price (low to high)")
  })

  it("displays the currently selected medium option on the filter screen", () => {
    state = {
      selectedFilters: [{ filterType: "medium", value: "Performance art" }],
      appliedFilters: [],
      previouslyAppliedFilters: [],
      applyFilters: false,
    }

    const filterScreen = mount(<MockFilterScreen initialState={state} />)
    expect(
      filterScreen
        .find(CurrentOption)
        .at(1)
        .text()
    ).toEqual("Performance art")
  })

  it("displays the filter screen apply button correctly when no filters are selected", () => {
    const filterScreen = mount(<MockFilterModalNavigator initialState={state} />)

    expect(filterScreen.find(ApplyButton).props().disabled).toEqual(true)
  })

  it("displays the filter screen apply button correctly when filters are selected", () => {
    state = {
      selectedFilters: [{ value: "Price (low to high)", filterType: "sort" }],
      appliedFilters: [],
      previouslyAppliedFilters: [],
      applyFilters: false,
    }

    const filterScreen = mount(<MockFilterModalNavigator initialState={state} />)

    expect(filterScreen.find(ApplyButton).props().disabled).toEqual(false)
  })

  it("displays both default medium and sort filters on the Filter modal", () => {
    const filterScreen = mount(<MockFilterScreen initialState={state} />)

    expect(
      filterScreen
        .find(CurrentOption)
        .at(0)
        .text()
    ).toEqual("Default")

    expect(
      filterScreen
        .find(CurrentOption)
        .at(1)
        .text()
    ).toEqual("All")
  })

  it("displays both selected medium and sort filters on the Filter modal", () => {
    state = {
      selectedFilters: [
        { filterType: "medium", value: "Drawing" },
        { filterType: "sort", value: "Price (low to high)" },
      ],
      appliedFilters: [],
      previouslyAppliedFilters: [],
      applyFilters: false,
    }

    const filterScreen = mount(<MockFilterScreen initialState={state} />)

    expect(
      filterScreen
        .find(CurrentOption)
        .at(0)
        .text()
    ).toEqual("Price (low to high)")

    expect(
      filterScreen
        .find(CurrentOption)
        .at(1)
        .text()
    ).toEqual("Drawing")

    expect(filterScreen.find(CurrentOption)).toHaveLength(2)
  })
})

describe("Clearing filters", () => {
  it("allows users to clear all filters when selecting clear all", () => {
    state = {
      selectedFilters: [
        { value: "Price (low to high)", filterType: "sort" },
        { value: "Sculpture", filterType: "medium" },
      ],
      appliedFilters: [{ value: "Recently added", filterType: "sort" }],
      previouslyAppliedFilters: [{ value: "Recently added", filterType: "sort" }],
      applyFilters: false,
    }

    const filterScreen = mount(<MockFilterScreen initialState={state} />)

    expect(
      filterScreen
        .find(CurrentOption)
        .at(0)
        .text()
    ).toEqual("Price (low to high)")

    expect(
      filterScreen
        .find(CurrentOption)
        .at(1)
        .text()
    ).toEqual("Sculpture")

    filterScreen
      .find(ClearAllButton)
      .at(0)
      .props()
      .onPress()

    expect(
      filterScreen
        .find(CurrentOption)
        .at(0)
        .text()
    ).toEqual("Default")
    expect(
      filterScreen
        .find(CurrentOption)
        .at(1)
        .text()
    ).toEqual("All")
  })

  it("enables the apply button when clearing all if no other options are selected", () => {
    state = {
      selectedFilters: [],
      appliedFilters: [{ value: "Recently added", filterType: "sort" }],
      previouslyAppliedFilters: [{ value: "Recently added", filterType: "sort" }],
      applyFilters: false,
    }

    const filterModal = mount(<MockFilterModalNavigator initialState={state} />)

    expect(
      filterModal
        .find(CurrentOption)
        .at(0)
        .text()
    ).toEqual("Recently added")
    expect(filterModal.find(ApplyButton).props().disabled).toEqual(true)

    filterModal
      .find(ClearAllButton)
      .at(0)
      .props()
      .onPress()

    filterModal.update()

    expect(
      filterModal
        .find(CurrentOption)
        .at(0)
        .text()
    ).toEqual("Default")
    expect(
      filterModal
        .find(CurrentOption)
        .at(1)
        .text()
    ).toEqual("All")
    expect(
      filterModal
        .find(ApplyButton)
        .at(0)
        .props().disabled
    ).toEqual(false)
  })

  it("the apply button shows the number of currently selected filters and its count resets after filters are applied", () => {
    state = {
      selectedFilters: [
        { value: "Price (high to low)", filterType: "sort" },
        { value: "Works on paper", filterType: "medium" },
      ],
      appliedFilters: [{ value: "Recently added", filterType: "sort" }],
      previouslyAppliedFilters: [{ value: "Recently added", filterType: "sort" }],
      applyFilters: true,
    }

    const filterModal = mount(<MockFilterModalNavigator initialState={state} />)
    const applyButton = filterModal.find(ApplyButton)

    expect(applyButton.text()).toContain("Apply (2)")

    applyButton.props().onPress()

    // After applying, we reset the selectedFilters
    expect(applyButton.text()).toContain("Apply")
  })
})

describe("Applying filters", () => {
  it("calls the relay method to refetch artworks when a filter is applied", async () => {
    state = {
      selectedFilters: [{ value: "Price (high to low)", filterType: "sort" }],
      appliedFilters: [{ value: "Price (high to low)", filterType: "sort" }],
      previouslyAppliedFilters: [{ value: "Price (high to low)", filterType: "sort" }],
      applyFilters: true,
    }

    const relayMock = {
      refetchConnection: jest.fn(),
      environment: {} as any,
      hasMore: jest.fn(),
      isLoading: jest.fn(),
      loadMore: jest.fn(),
      refetch: undefined,
    } as RelayPaginationProp

    // @ts-ignore STRICTNESS_MIGRATION
    const render = marketingCollection =>
      renderRelayTree({
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
                <CollectionArtworks collection={{ ...marketingCollection }} relay={relayMock} />
              </ArtworkFilterContext.Provider>
            </Theme>
          )
        },
        query: graphql`
          query FilterModalTestsQuery @raw_response_type {
            marketingCollection(slug: "street-art-now") {
              ...CollectionArtworks_collection
            }
          }
        `,
        mockData: { marketingCollection },
      })

    render(CollectionFixture).then(() => {
      expect(relayMock.refetchConnection).toHaveBeenCalled()
    })
  })
})
