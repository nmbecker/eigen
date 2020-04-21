import React from "react"
import { Dimensions, NativeModules, StatusBarIOS, TextInput, TouchableWithoutFeedback } from "react-native"

import colors from "lib/data/colors"
import fonts from "lib/data/fonts"
// @ts-ignore STRICTNESS_MIGRATION
import styled from "styled-components/native"

import { Schema, Track, track as _track } from "../../../utils/track"

const isPad = Dimensions.get("window").width > 700

interface ContainerProps {
  active: boolean
}

const Container = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-width: 1;
  border-color: ${colors["gray-regular"]};
  border-radius: 3;
  margin: 0 20px 20px;
  background-color: ${(p: ContainerProps) => (p.active ? "white" : colors["gray-light"])};
`

const StyledKeyboardAvoidingView = styled.KeyboardAvoidingView`
  flex: 1;
  ${isPad ? "width: 708; align-self: center;" : ""};
`

interface StyledSendButtonProps {
  disabled: boolean
}

export const SendButton = styled.Text`
  font-family: ${fonts["avant-garde-regular"]};
  font-size: 12;
  margin-right: 10;
  color: ${(p: StyledSendButtonProps) => (p.disabled ? colors["gray-regular"] : colors["purple-regular"])};
`

interface Props {
  disabled?: boolean
  onSubmit?: (text: string) => any
  value?: string
}

interface State {
  active: boolean
  text: string
  statusBarHeight: number
}

// @ts-ignore STRICTNESS_MIGRATION
const track: Track<Props, State, Schema.Entity> = _track

@track()
export default class Composer extends React.Component<Props, State> {
  input?: TextInput | any

  statusBarListener = null

  // @ts-ignore STRICTNESS_MIGRATION
  constructor(props) {
    super(props)

    this.state = {
      active: false,
      // @ts-ignore STRICTNESS_MIGRATION
      text: null,
      statusBarHeight: 0,
    }
  }

  componentDidMount() {
    const { StatusBarManager } = NativeModules
    if (StatusBarManager && StatusBarManager.getHeight) {
      // @ts-ignore STRICTNESS_MIGRATION
      StatusBarManager.getHeight(statusBarFrameData => {
        this.setState({ statusBarHeight: statusBarFrameData.height })
      })
      // @ts-ignore STRICTNESS_MIGRATION
      this.statusBarListener = StatusBarIOS.addListener("statusBarFrameWillChange", statusBarData => {
        this.setState({ statusBarHeight: statusBarData.frame.height })
      })
    }
  }

  @track(_props => ({
    action_type: Schema.ActionTypes.Tap,
    action_name: Schema.ActionNames.ConversationSendReply,
  }))
  submitText() {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state.text)
      // @ts-ignore STRICTNESS_MIGRATION
      this.setState({ text: null })
    }
  }

  componentDidUpdate() {
    if (this.props.value && !this.state.text) {
      this.setState({ text: this.props.value })
    }
  }

  componentWillUnmount() {
    // @ts-ignore STRICTNESS_MIGRATION
    this.statusBarListener.remove()
  }

  render() {
    // The TextInput loses its isFocused() callback as a styled component
    const inputStyles = {
      flex: 1,
      fontFamily: fonts["garamond-regular"],
      fontSize: 13,
      paddingLeft: 10,
      paddingTop: 13,
      paddingBottom: 10,
      paddingRight: 10,
    }

    const disableSendButton = !(this.state.text && this.state.text.length) || this.props.disabled

    return (
      <StyledKeyboardAvoidingView behavior="padding" keyboardVerticalOffset={this.state.statusBarHeight}>
        {this.props.children}
        <Container active={this.state.active}>
          <TextInput
            placeholder={"Reply..."}
            placeholderTextColor={colors["gray-semibold"]}
            keyboardAppearance={"dark"}
            onEndEditing={() => this.setState({ active: false })}
            onFocus={() => this.setState({ active: this.input.isFocused() })}
            onChangeText={text => this.setState({ text })}
            ref={input => (this.input = input)}
            style={inputStyles}
            multiline={true}
            value={this.state.text}
            autoFocus={typeof jest === "undefined" /* TODO: https://github.com/facebook/jest/issues/3707 */}
          />
          <TouchableWithoutFeedback disabled={disableSendButton} onPress={this.submitText.bind(this)}>
            <SendButton disabled={disableSendButton}>Send</SendButton>
          </TouchableWithoutFeedback>
        </Container>
      </StyledKeyboardAvoidingView>
    )
  }
}
