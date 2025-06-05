import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Dropdown = styled.ul`
  position: absolute;
  width: 100%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Option = styled.li`
  padding: 8px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const AutoCompleteSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  getOptionLabel,
  getOptionValue,
  isMulti = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    if (inputValue === '') {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter(option => 
          getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    }
  }, [inputValue, options, getOptionLabel]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleOptionSelect = (option) => {
    setInputValue(getOptionLabel(option));
    onChange(option);
    setIsOpen(false);
  };

  return (
    <Container>
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      />
      {isOpen && filteredOptions.length > 0 && (
        <Dropdown>
          {filteredOptions.map((option) => (
            <Option
              key={getOptionValue(option)}
              onClick={() => handleOptionSelect(option)}
            >
              {getOptionLabel(option)}
            </Option>
          ))}
        </Dropdown>
      )}
    </Container>
  );
};

export default AutoCompleteSelect;
