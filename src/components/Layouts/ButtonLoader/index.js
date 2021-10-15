import React from "react";

const ButtonLoader = ({
	loading = false,
	onClick = () => {},
	title = 'Button',
	loadingTitle = 'Loading',
	buttonStyle = {},
	titleStyle = {}
}) => {

	return (
		<div>
			<button className="button" onClick={onClick} disabled={loading} style={buttonStyle}>
				{loading && (
					<i
						className="fa fa-refresh fa-spin"
						style={{ marginRight: "5px" }}
					/>
				)}
				{loading && <span style={titleStyle}>{loadingTitle}</span>}
				{!loading && <span style={titleStyle}>{title}</span>}
			</button>
		</div>
	)
}

export default ButtonLoader