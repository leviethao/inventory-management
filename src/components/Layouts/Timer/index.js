import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { useInterval } from '../../../hooks/useInterval'

const Timer = () => {
	const [time, setTime] = useState(moment(new Date()).format('DD/MM/YYYY HH:mm:ss'))

	useInterval(() => {
		setTime(moment(new Date()).format('DD/MM/YYYY HH:mm:ss'))
	}, 500)

	return (
		<span>
			{time}
		</span>
	)
}

export default Timer