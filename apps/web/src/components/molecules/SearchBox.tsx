import React from 'react';
import {
  SearchBox as FluentSearchBox,
  SearchBoxProps,
  InputOnChangeData,
  SearchBoxChangeEvent
} from '@fluentui/react-components';

export interface CustomSearchBoxProps extends SearchBoxProps {
  onSearch?: (value: string) => void;
}

export const SearchBox: React.FC<CustomSearchBoxProps> = ({ onSearch, ...props }) => {
  const handleChange = (event: SearchBoxChangeEvent, data: InputOnChangeData) => {
    if (onSearch) {
      onSearch(data.value);
    }
    if (props.onChange) {
      props.onChange(event, data);
    }
  };

  return (
    <FluentSearchBox
      {...props}
      onChange={handleChange}
    />
  );
};

export default SearchBox;
