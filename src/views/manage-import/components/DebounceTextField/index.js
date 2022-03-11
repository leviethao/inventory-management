import React, { useCallback, useEffect, useRef, useState } from 'react'
import _ from 'lodash'
import { Input } from 'reactstrap';
import { TextField } from '@mui/material';

const DebounceTextField = ({
    value = '',
    onChange = (text) => {},
    type='text',
    style,
    size='small',
    label="Select a value",
    ...props
}) => {
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
        <TextField
            {...props}
            placeholder='Empty'
            type={type}
            onChange={onChangeText}
            style={style}
            label={label}
            size={size}
            value={text}
        />
    )
}

export default DebounceTextField