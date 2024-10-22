import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { Input } from '../custom/UnderlinedInput' // UI Input 컴포넌트의 경로는 프로젝트 구조에 맞게 수정하세요.

function noop() {}

function format(value: string, pattern: string) {
  if (!pattern) return value

  const placeholder = '#'

  let endOfValue = 0
  let characterIndex = 0
  let newValue = value

  return [...pattern]
    .map((patternCharacter, index) => {
      const character = newValue[characterIndex]
      const patternLength = pattern.length

      if (!endOfValue) {
        if (index === patternLength - 1) endOfValue = patternLength
        if (character === undefined) endOfValue = pattern.indexOf(placeholder, index)
      }

      if (patternCharacter === placeholder) {
        characterIndex = characterIndex + 1
        return character
      }

      return patternCharacter
    })
    .splice(0, endOfValue)
    .join('')
}

function stripPatternCharacters(value: string) {
  return value.replace(/[^\dA-z]/g, '')
}

function isUserCharacter(character: string) {
  return /[\dA-z]/.test(character)
}

const cursorPositionFallback = 0

type FormattedInputProps = Parameters<typeof Input>[0] & {
  pattern: string
  onValueChange: (value: string) => void
}

const FormattedInput = forwardRef<HTMLInputElement, FormattedInputProps>(
  ({ onChange = () => {}, onValueChange = () => {}, value: userValue = '', pattern, ...rest }, ref) => {
    const [value, setValue] = useState(format(userValue + '', pattern))
    const inputRef = (ref as React.MutableRefObject<HTMLInputElement>) || useRef<HTMLInputElement>(null)
    const infoRef = useRef<{
      cursorPosition: number
      endOfSection: boolean
    }>({
      cursorPosition: 0,
      endOfSection: false
    })

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
      const { target } = event
      const { value: inputValue, selectionStart: cursorPosition } = target
      const didDelete = inputValue.length < value.length

      const safeCursorPosition = cursorPosition ?? cursorPositionFallback
      infoRef.current.cursorPosition = safeCursorPosition

      let rawValue = stripPatternCharacters(inputValue)

      if (didDelete) {
        const patternCharacterDeleted = !isUserCharacter([...value][safeCursorPosition])

        if (patternCharacterDeleted) {
          const firstBit = inputValue.substr(0, safeCursorPosition)
          const rawFirstBit = stripPatternCharacters(firstBit)

          rawValue =
            rawFirstBit.substr(0, rawFirstBit.length - 1) +
            stripPatternCharacters(inputValue.substr(safeCursorPosition, inputValue.length))

          infoRef.current.cursorPosition = firstBit.replace(/([\d\w]+)[^\dA-z]+$/, '$1').length - 1
        }
      }

      const formattedValue = format(rawValue, pattern)

      infoRef.current.endOfSection = false

      if (!didDelete) {
        const formattedCharacters = [...formattedValue]
        const nextCharacter = formattedCharacters[safeCursorPosition]
        const nextCharacterIsPattern = !isUserCharacter(nextCharacter)
        const nextUserCharacterIndex = formattedValue.substr(safeCursorPosition).search(/[\dA-z]/)
        const numbersAhead = nextUserCharacterIndex !== -1

        infoRef.current.endOfSection = nextCharacterIsPattern && !numbersAhead

        if (nextCharacterIsPattern && !isUserCharacter(formattedCharacters[safeCursorPosition - 1]) && numbersAhead)
          infoRef.current.cursorPosition = safeCursorPosition + nextUserCharacterIndex + 1
      }

      onValueChange(rawValue)
      onChange(event)
      setValue(formattedValue)
    }

    useEffect(() => {
      const { cursorPosition, endOfSection } = infoRef.current

      if (endOfSection) return

      inputRef.current?.setSelectionRange(cursorPosition, cursorPosition)
    }, [value, inputRef])

    return (
      <Input
        maxLength={(pattern && pattern.length) || undefined}
        onChange={handleChange}
        ref={inputRef}
        value={value}
        {...rest}
      />
    )
  }
)

FormattedInput.displayName = 'FormattedInput'

export default FormattedInput
