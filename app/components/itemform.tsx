import { Form } from "react-router";
import { Textarea } from "./ui/textarea";

export default function ItemForm() {
	return (
		<div>
			<Form>
				<label htmlFor="items">What do you have in your fridge?</label>
				<Textarea
					id="items"
					placeholder="Enter items present in your fridge..."
					name="items"
				/>
				<label></label>
			</Form>
		</div>
	);
}
