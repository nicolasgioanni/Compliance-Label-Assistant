import { DEFAULT_GOVERNMENT_WARNING } from '../constants/defaultWarningText';

const FIELD_DEFINITIONS = [
  { id: 'brandName', label: 'Brand Name', type: 'text' },
  { id: 'classType', label: 'Class/Type', type: 'text' },
  { id: 'alcoholContent', label: 'Alcohol Content', type: 'text' },
  { id: 'netContents', label: 'Net Contents', type: 'text' },
];

export default function ExpectedFieldsForm({ expectedFields, onChange }) {
  function updateField(fieldName, value) {
    onChange({ ...expectedFields, [fieldName]: value });
  }

  function useDefaultWarning() {
    updateField('governmentWarning', DEFAULT_GOVERNMENT_WARNING);
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <h2>Expected Application Data</h2>
      </div>
      <div className="form-grid">
        {FIELD_DEFINITIONS.map((field) => (
          <label className="field" key={field.id}>
            <span>{field.label}</span>
            <input
              type={field.type}
              value={expectedFields[field.id]}
              onChange={(event) => updateField(field.id, event.target.value)}
            />
          </label>
        ))}
      </div>
      <label className="field warning-field">
        <span>Government Warning Text</span>
        <textarea
          rows="5"
          value={expectedFields.governmentWarning}
          onChange={(event) => updateField('governmentWarning', event.target.value)}
        />
      </label>
      <button className="secondary-button" type="button" onClick={useDefaultWarning}>
        Use Standard Warning Text
      </button>
    </section>
  );
}

