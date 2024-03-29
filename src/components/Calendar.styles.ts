import styled from "styled-components";

const CalenderStyles = styled.section<{
  $width: string;
  $height: string;
}>`
  * {
    padding: 0;
    margin: 0;
    outline: none;
  }
  width: max-content;
  height: max-content;
  & > div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    margin-bottom: 10px;
    & > div {
      display: flex;
      gap: 20px;
    }
  }
  & > table {
    border-collapse: collapse;
    & th,
    & td {
      border: 1px solid black;
      text-align: center;
      min-width: calc(${(props) => props.$width} / 7);
      max-width: calc(${(props) => props.$width} / 7);
    }
    & th {
      height: calc(${(props) => props.$height} / 10);
    }
    & td {
      height: calc(${(props) => props.$height} / 7);
    }
  }
`;

export const ButtonStyles = styled.button`
  outline: none;
  border: none;
  background: none;
  color: rgb(211, 211, 211);
  border-radius: 5px;
  &:hover {
    background-color: rgba(211, 211, 211, 0.5);
    transition: 0.2s ease-in-out;
  }
`;

export const SelectStyles = styled.select`
  border-radius: 3px;
  padding: 2px;
  cursor: pointer;
`;

export default CalenderStyles;
