import PropTypes from 'prop-types';
import Button from '../Button/Button.jsx';

function NewGameForm({ onCancel }) {
  return (
    <div>
      <p>New game setup coming soon.</p>
      {onCancel && (
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}

NewGameForm.propTypes = {
  onCancel: PropTypes.func,
};

export default NewGameForm;
