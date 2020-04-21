import { Theme } from "@artsy/palette"
import { CitySavedList_viewer } from "__generated__/CitySavedList_viewer.graphql"
import { CitySavedListQuery } from "__generated__/CitySavedListQuery.graphql"
import { PAGE_SIZE } from "lib/data/constants"
import { defaultEnvironment } from "lib/relay/createEnvironment"
import { isCloseToBottom } from "lib/utils/isCloseToBottom"
import renderWithLoadProgress from "lib/utils/renderWithLoadProgress"
import { Schema, screenTrack } from "lib/utils/track"
import React from "react"
import { createPaginationContainer, graphql, QueryRenderer, RelayPaginationProp, RelayProp } from "react-relay"
import { CityFairListContainer } from "./CityFairList"
import { EventList } from "./Components/EventList"

interface Props {
  viewer: CitySavedList_viewer
  relay: RelayPaginationProp
  citySlug: string
}

interface State {
  fetchingNextPage: boolean
}

@screenTrack((props: Props) => ({
  context_screen: Schema.PageNames.CityGuideSavedList,
  context_screen_owner_type: Schema.OwnerEntityTypes.CityGuide,
  context_screen_owner_slug: props.citySlug,
  context_screen_owner_id: props.citySlug,
}))
class CitySavedList extends React.Component<Props, State> {
  state = {
    fetchingNextPage: false,
  }

  fetchData = () => {
    const { relay } = this.props

    if (!relay.hasMore() || relay.isLoading()) {
      return
    }
    this.setState({ fetchingNextPage: true })
    relay.loadMore(PAGE_SIZE, error => {
      if (error) {
        console.error("CitySectionList.tsx #fetchData", error.message)
        // FIXME: Handle error
      }
      this.setState({ fetchingNextPage: false })
    })
  }

  // @TODO: Implement test for this component https://artsyproduct.atlassian.net/browse/LD-562
  render() {
    const {
      viewer: {
        me: {
          // @ts-ignore STRICTNESS_MIGRATION
          followsAndSaves: {
            shows: { edges },
          },
        },
        // @ts-ignore STRICTNESS_MIGRATION
        city: { name },
      },
      relay,
    } = this.props
    const { fetchingNextPage } = this.state
    return (
      <Theme>
        <EventList
          header="Saved shows"
          cityName={name}
          // @ts-ignore STRICTNESS_MIGRATION
          bucket={edges.map(e => e.node) as any}
          type="saved"
          // @ts-ignore STRICTNESS_MIGRATION
          relay={relay as RelayProp}
          // @ts-ignore STRICTNESS_MIGRATION
          onScroll={isCloseToBottom(this.fetchData)}
          fetchingNextPage={fetchingNextPage}
        />
      </Theme>
    )
  }
}

export const CitySavedListContainer = createPaginationContainer(
  CitySavedList,
  {
    viewer: graphql`
      fragment CitySavedList_viewer on Query
        @argumentDefinitions(count: { type: "Int", defaultValue: 20 }, cursor: { type: "String", defaultValue: "" }) {
        city(slug: $citySlug) {
          name
        }
        me {
          followsAndSaves {
            shows: showsConnection(first: $count, status: RUNNING_AND_UPCOMING, city: $citySlug, after: $cursor)
              @connection(key: "CitySavedList_shows") {
              edges {
                node {
                  slug
                  internalID
                  id
                  name
                  isStubShow
                  status
                  href
                  is_followed: isFollowed
                  isStubShow
                  exhibition_period: exhibitionPeriod
                  cover_image: coverImage {
                    url
                  }
                  location {
                    coordinates {
                      lat
                      lng
                    }
                  }
                  type
                  start_at: startAt
                  end_at: endAt
                  partner {
                    ... on Partner {
                      name
                      type
                      profile {
                        image {
                          url(version: "square")
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
  {
    direction: "forward",
    getConnectionFromProps(props) {
      return props.viewer.me && props.viewer.me.followsAndSaves && props.viewer.me.followsAndSaves.shows
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      }
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        citySlug: props.citySlug,
        ...fragmentVariables,
        count,
        cursor,
      }
    },
    query: graphql`
      query CitySavedListPaginationQuery($count: Int!, $cursor: String, $citySlug: String!) {
        ...CitySavedList_viewer @arguments(count: $count, cursor: $cursor)
      }
    `,
  }
)

interface CitySavedListProps {
  citySlug: string
}
export const CitySavedListRenderer: React.SFC<CitySavedListProps> = ({ citySlug }) => {
  return (
    <QueryRenderer<CitySavedListQuery>
      environment={defaultEnvironment}
      query={graphql`
        query CitySavedListQuery($citySlug: String!) {
          ...CitySavedList_viewer
        }
      `}
      variables={{ citySlug }}
      render={renderWithLoadProgress(CityFairListContainer)}
    />
  )
}
