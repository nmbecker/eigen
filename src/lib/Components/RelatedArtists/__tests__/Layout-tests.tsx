import React from "react"
import "react-native"
import { renderWithLayout } from "../../../tests/renderWithLayout"

import RelatedArtists from "../"

it("renders without throwing an error", () => {
  const artists = [
    {
      id: "artist-sarah-scott",
      name: "Sarah Scott",
      counts: {
        for_sale_artworks: 2,
        artworks: 4,
      },
    },
  ]

  const layout = { width: 768 }

  renderWithLayout(<RelatedArtists artists={artists as any} />, layout)
})
