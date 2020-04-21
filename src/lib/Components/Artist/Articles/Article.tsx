import React from "react"
import { createFragmentContainer, graphql } from "react-relay"

import { StyleSheet, TextStyle, TouchableWithoutFeedback, View, ViewProperties, ViewStyle } from "react-native"

import ImageView from "lib/Components/OpaqueImageView/OpaqueImageView"
import fonts from "lib/data/fonts"
import SwitchBoard from "lib/NativeModules/SwitchBoard"

import { color, Sans, Serif } from "@artsy/palette"
import { Article_article } from "__generated__/Article_article.graphql"

interface Props extends ViewProperties {
  article: Article_article
}

class Article extends React.Component<Props> {
  handleTap() {
    // @ts-ignore STRICTNESS_MIGRATION
    SwitchBoard.presentNavigationViewController(this, this.props.article.href)
  }

  render() {
    const article = this.props.article
    const imageURL = article.thumbnail_image && article.thumbnail_image.url
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={this.handleTap.bind(this)}>
          <View style={styles.touchableContent}>
            {imageURL && (
              <ImageView
                style={styles.image}
                // @ts-ignore STRICTNESS_MIGRATION
                imageURL={article.thumbnail_image.url}
              />
            )}
            <Serif ellipsizeMode="tail" size="3">
              {article.thumbnail_title}
            </Serif>
            {article.author && (
              <Sans size="2" color={color("black60")}>
                {article.author.name}
              </Sans>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}

interface Styles {
  container: ViewStyle
  touchableContent: ViewStyle
  image: ViewStyle
  sansSerifText: TextStyle
  serifText: TextStyle
}

const styles = StyleSheet.create<Styles>({
  // TODO: The outer wrapping view is currently only there because setting `marginRight: 20` on the Article from the
  //      Articles component isn’t working.
  container: {
    width: 320,
  },
  touchableContent: {
    width: 300,
  },
  image: {
    width: 300,
    height: 175,
  },
  sansSerifText: {
    fontSize: 10,
    textAlign: "left",
    marginTop: 5,
    fontFamily: fonts["avant-garde-regular"],
    color: "grey",
  },
  serifText: {
    fontFamily: "AGaramondPro-Regular",
    fontSize: 16,
    marginTop: 10,
    width: 275,
  },
})

export default createFragmentContainer(Article, {
  article: graphql`
    fragment Article_article on Article {
      thumbnail_title: thumbnailTitle
      href
      author {
        name
      }
      thumbnail_image: thumbnailImage {
        url(version: "large")
      }
    }
  `,
})
