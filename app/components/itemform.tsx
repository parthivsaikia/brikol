import { Form } from "react-router";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function ItemForm() {
	return (
		<div>
			<Form>
				<Label htmlFor="items">What do you have in your fridge?</Label>
				<Textarea
					id="items"
					placeholder="Enter items present in your fridge..."
					name="items"
				/>
				<Label htmlFor="servings">Number of servings</Label>
				<Input id="servings" name="servings" type="number"></Input>
				<Button type="submit">Generate</Button>
			</Form>
		</div>
	);
}
