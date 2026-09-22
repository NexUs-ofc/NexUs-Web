import { useState, type HTMLInputTypeAttribute } from "react";
import type GenericComponentProps from "../../utils/GenericComponentProps";
import type { ChangeEvent } from "react";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import "./form-input.css";

interface FormInputProps extends GenericComponentProps {
  type?: HTMLInputTypeAttribute;
  width?: string;
  label: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInput({
  className = "",
  id = crypto.randomUUID(),
  type = "text",
  width = "100%",
  label,
  placeholder,
  onChange,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handleIconClick = () => {
    setShowPassword((previousValue) => !previousValue);
  };

  if (type === "password") {
    return (
      <div
        className={`formInputContainer ${className}`}
        style={{ width }}
      >
        <label
          className="formLabel"
          htmlFor={id}
        >
          {label}
        </label>
        <div className="formPasswordInputContainer">
          <input
            className="formInput formNormalInput formPasswordInput"
            id={id}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            onChange={onChange}
          />
          <button
            type="button"
            className="passwordToggle"
            onClick={handleIconClick}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <MdOutlineVisibility className="icon passwordIcon" />
            ) : (
              <MdOutlineVisibilityOff className="icon passwordIcon" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`formInputContainer ${className}`}
      style={{ width }}
    >
      <label
        className="formLabel"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        className="formNormalInput formInput"
        id={id}
        type={type}
        placeholder={placeholder}
        onChange={onChange}
      />
    </div>
  );
}
