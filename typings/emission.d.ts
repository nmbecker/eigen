import { NativeModulesStatic } from "react-native"
declare module "react-native" {
  interface NativeModulesStatic {
    Emission: {
      userID: string
      authenticationToken: string
      launchCount: number

      gravityURL: string
      metaphysicsURL: string
      predictionURL: string
      userAgent: string

      env: "production" | "staging" | "test"

      // Empty is falsy in JS, so these are fine too.
      googleMapsAPIKey: string
      sentryDSN: string
      stripePublishableKey: string
      mapBoxAPIClientKey: string
      options: {
        AROptionsLotConditionReport: boolean
        AROptionsFilterCollectionsArtworks: boolean
        AROptionsViewingRooms: boolean
        AROptionsPriceTransparency: boolean
        ipad_vir: boolean
        iphone_vir: boolean
        ARDisableReactNativeBidFlow: boolean
        AREnableBuyNowFlow: boolean
        AREnableMakeOfferFlow: boolean
        AREnableLocalDiscovery: boolean
        ARReactNativeArtworkEnableAlways: boolean
        ARReactNativeArtworkEnableNonCommercial: boolean
        ARReactNativeArtworkEnableNSOInquiry: boolean
        ARReactNativeArtworkEnableAuctions: boolean
        AREnableNewPartnerView: boolean
        AREnableNewSearch: boolean
      }
    }
  }
}
