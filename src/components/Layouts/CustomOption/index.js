import React, { useCallback, useEffect, useState } from 'react'

const CustomOption = (props) => {
	const { data, innerRef, innerProps, isSelected } = props
	const [optionBackground, setOptionBackground] = useState('#fff')

	useEffect(() => {
		setOptionBackground(isSelected ? 'yellow': '#fff')
	}, [isSelected])

	const changeBackground = useCallback((color) => () => {
		setOptionBackground(color)
	}, [])

	return (
		<div
			ref={innerRef}
			{...innerProps}
			style={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				padding: 16,
				paddingTop: 8,
				paddingBottom: 8,
				background: optionBackground
			}}
			onMouseEnter={changeBackground('rgba(252, 159, 203, 0.5)')}
			onMouseLeave={changeBackground(isSelected ? 'yellow' : '#fff')}
		>
			<div style={{borderRadius: 8, overflow: 'hidden'}}>
				<img src={data.imageUrl} style={{width: 50, height: 50}} />
			</div>
			<div style={{ marginLeft: 24 }}>{data.label}</div>
		</div>
	)
}

export default CustomOption