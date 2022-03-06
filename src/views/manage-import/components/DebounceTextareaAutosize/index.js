import React, { useCallback, useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import { TextareaAutosize } from '@mui/material';

const DebounceTextareaAutosize = ({value = '', onChange = (text) => {}}) => {
    const [text, setText] = useState('')

    useEffect(() => {
        setText(value)
    }, [value])

    const debounceOnChange = useRef(_.debounce((text) => {
        onChange(text)
    }, 300)).current
    
    const onChangeText = useCallback((event) => {
        debounceOnChange(event.target.value)
        setText(event.target.value)
    }, [debounceOnChange])

    return (
        <TextareaAutosize
            value={text}
            aria-label="empty textarea"
            placeholder="Empty"
            onChange={onChangeText}
            style={{ width: 200 }}
        />
    )
}

export default DebounceTextareaAutosize