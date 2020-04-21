import { color, Spacer } from "@artsy/palette"
import { Schema } from "lib/utils/track"
import { useScreenDimensions } from "lib/utils/useScreenDimensions"
import React, { useMemo, useRef, useState } from "react"
import { NativeModules, View } from "react-native"
import Animated from "react-native-reanimated"
import { useTracking } from "react-tracking"
import { useAnimatedValue } from "./reanimatedHelpers"
import { SnappyHorizontalRail } from "./SnappyHorizontalRail"
import { StickyTabPageFlatListContext } from "./StickyTabPageFlatList"
import { StickyTabPageTabBar } from "./StickyTabPageTabBar"

const { ARSwitchBoardModule } = NativeModules

interface TabProps {
  initial?: boolean
  title: string
  content: JSX.Element
}

/**
 * This page wrapper encapsulates a disappearing header and sticky tabs each with their own content
 *
 * At the moment all tabs are rendered at all times, as this isn't designed for more than 3 tabs
 * but if we need to have conditional rendering of tab content in the future it should be possible.
 *
 * Each tab optionally consumes a 'scroll view context' which could potentialy contain information
 * about whether the tab is being shown currently etc.
 */
export const StickyTabPage: React.FC<{
  tabs: TabProps[]
  headerContent: JSX.Element
}> = ({ tabs, headerContent }) => {
  const { width } = useScreenDimensions()
  const initialTabIndex = useMemo(
    () =>
      Math.max(
        tabs.findIndex(tab => tab.initial),
        0
      ),
    []
  )
  const activeTabIndex = useAnimatedValue(initialTabIndex)
  const [headerHeight, setHeaderHeightNativeWrapper] = useState<null | Animated.Value<number>>(
    // in test files we don't care about getting the right height for the header, so
    // we just set it now to avoid having to trigger an 'onLayout' in every test
    process.env.NODE_ENV === "test" ? new Animated.Value(300) : null
  )
  const tracking = useTracking()
  const headerOffsetY = useAnimatedValue(0)
  const railRef = useRef<SnappyHorizontalRail>()

  const shouldHideBackButton = Animated.lessOrEq(headerOffsetY, -10)

  Animated.useCode(
    () =>
      Animated.onChange(
        shouldHideBackButton,
        Animated.call([shouldHideBackButton], ([shouldHide]) => {
          ARSwitchBoardModule.updateShouldHideBackButton(shouldHide)
        })
      ),
    []
  )

  return (
    <View style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {/* put tab content first because we want the header to be absolutely positioned _above_ it */}
      {headerHeight !== null && (
        <SnappyHorizontalRail
          ref={railRef as any /* STRICTNESS_MIGRATION */}
          initialOffset={initialTabIndex * width}
          width={width * tabs.length}
        >
          {tabs.map(({ content }, index) => {
            return (
              <View style={{ flex: 1, width }} key={index}>
                <StickyTabPageFlatListContext.Provider
                  value={{
                    tabIsActive: Animated.eq(index, activeTabIndex),
                    headerHeight,
                    headerOffsetY,
                  }}
                >
                  {content}
                </StickyTabPageFlatListContext.Provider>
              </View>
            )
          })}
        </SnappyHorizontalRail>
      )}
      <Animated.View
        style={{
          width,
          top: 0,
          position: "absolute",
          backgroundColor: color("white100"),
          transform: [{ translateY: headerOffsetY as any }],
        }}
      >
        <View
          onLayout={e => {
            if (headerHeight) {
              headerHeight.setValue(e.nativeEvent.layout.height)
            } else {
              setHeaderHeightNativeWrapper(new Animated.Value(e.nativeEvent.layout.height))
            }
          }}
        >
          {headerContent}
          <Spacer mb={1} />
        </View>
        <StickyTabPageTabBar
          labels={tabs.map(({ title }) => title)}
          initialActiveIndex={initialTabIndex}
          onIndexChange={index => {
            activeTabIndex.setValue(index)
            railRef.current?.setOffset(index * width)
            tracking.trackEvent({
              action_name: tabs[index].title,
              action_type: Schema.ActionTypes.Tap,
            })
          }}
        />
      </Animated.View>
    </View>
  )
}
