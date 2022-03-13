import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear'
import _ from 'lodash'

const SearchBar = ({onSearch = (text) => {}}) => {
    const [value, setValue] = React.useState('')

    const debounceOnChange = React.useRef(_.debounce((text) => {
        onSearch(text)
    }, 300)).current

    const onChange = React.useCallback((event) => {
        debounceOnChange(event.target.value)
        setValue(event.target.value)
    }, [debounceOnChange])

    const onPressClearButton = React.useCallback(() => {
        onSearch('')
        setValue('')
    }, [onSearch])

    return (
        <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Toolbar>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <SearchIcon color="inherit" sx={{ display: 'block' }} />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                placeholder="Search Supplier"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: 'default' },
                }}
                variant="standard"
                onChange={onChange}
                value={value}
              />
            </Grid>
            <Grid item>
              <Tooltip title="Clear">
                <IconButton onClick={onPressClearButton}>
                  <ClearIcon color="inherit" sx={{ display: 'block' }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    )
}

export default SearchBar