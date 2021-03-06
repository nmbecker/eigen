import { FilterArray } from "lib/utils/ArtworkFiltersStore"
import { changedFiltersParams, filterArtworksParams } from "../FilterArtworksHelpers"

describe("changedFiltersParams helper", () => {
  it("when a medium selection changed and sort selection unchanged", () => {
    const appliedFilters = filterArtworksParams([
      { filterType: "sort", value: "Default" },
      { filterType: "medium", value: "Performance art" },
    ])
    expect(
      changedFiltersParams(appliedFilters, [
        { filterType: "sort", value: "Default" },
        { filterType: "medium", value: "Photography" },
      ])
    ).toEqual({ medium: "photography" })
  })

  it("when a medium and sort selection made from initial state", () => {
    const appliedFilters = filterArtworksParams([])
    expect(
      changedFiltersParams(appliedFilters, [
        { filterType: "sort", value: "Recently updated" },
        { filterType: "medium", value: "Sculpture" },
      ])
    ).toEqual({ medium: "sculpture", sort: "-partner_updated_at" })
  })

  it("when medium selection and sort selection changed", () => {
    const appliedFilters = filterArtworksParams([
      { filterType: "sort", value: "Default" },
      { filterType: "medium", value: "Sculpture" },
    ])
    expect(
      changedFiltersParams(appliedFilters, [
        { filterType: "sort", value: "Artwork year (ascending)" },
        { filterType: "medium", value: "All" },
      ])
    ).toEqual({ medium: "*", sort: "year" })
  })

  it("when a medium selection unchanged and sort selection changed", () => {
    const appliedFilters = filterArtworksParams([
      { filterType: "sort", value: "Artwork year (descending)" },
      { filterType: "medium", value: "Painting" },
    ])
    expect(
      changedFiltersParams(appliedFilters, [
        { filterType: "sort", value: "Artwork year (ascending)" },
        { filterType: "medium", value: "Painting" },
      ])
    ).toEqual({ sort: "year" })
  })

  it("when clearing applied filters", () => {
    const appliedFilters = filterArtworksParams([
      { filterType: "sort", value: "Artwork year (ascending)" },
      { filterType: "medium", value: "All" },
    ])
    expect(changedFiltersParams(appliedFilters, [])).toEqual({
      sort: "-decayed_merch",
    })
  })

  it("when clearing applied filters from medium and sort selections made", () => {
    const appliedFilters = filterArtworksParams([
      { filterType: "sort", value: "Recently added" },
      { filterType: "medium", value: "Performance art" },
    ])
    expect(changedFiltersParams(appliedFilters, [])).toEqual({ sort: "-decayed_merch", medium: "*" })
  })
})

describe("filterArtworksParams helper", () => {
  let appliedFilters: FilterArray

  it("maps applied filters to relay params when default filters", () => {
    appliedFilters = [
      { filterType: "sort", value: "Default" },
      { filterType: "medium", value: "All" },
    ]
    expect(filterArtworksParams(appliedFilters)).toEqual({ sort: "-decayed_merch", medium: "*" })
  })

  it("maps applied filters to relay params when no filters", () => {
    appliedFilters = []
    expect(filterArtworksParams(appliedFilters)).toEqual({ sort: "-decayed_merch", medium: "*" })
  })

  it("maps applied filters to a default filter relay params when a single filter applied", () => {
    appliedFilters = [{ filterType: "sort", value: "Artwork year (descending)" }]
    expect(filterArtworksParams(appliedFilters)).toEqual({ sort: "-year", medium: "*" })
  })

  it("maps applied filters to relay params when multiple filters", () => {
    appliedFilters = [
      { filterType: "sort", value: "Recently updated" },
      { filterType: "medium", value: "Works on paper" },
    ]
    expect(filterArtworksParams(appliedFilters)).toEqual({ sort: "-partner_updated_at", medium: "work-on-paper" })
  })
})
