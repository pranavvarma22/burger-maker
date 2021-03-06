import React, { Component } from 'react';
import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
const INGREDIENTS_PRICES = {
	meat: 30,
	cheese: 25,
	bacon: 20,
	salad: 15
};

class BurgerBuilder extends Component {
	state = {
		ingredients: null,
		totalPrice: 20,
		purchasable: false,
		purchasing: false,
		loading: false,
		error: null
	};
	componentDidMount() {
		axios
			.get('/ingredients.json')
			.then(response => this.setState({ ingredients: response.data }))
			.catch(error => this.setState({ error: error.message }));
	}

	updatePurchaseState(totalPrice) {
		this.setState({ purchasable: totalPrice > 20 });
	}

	addIngredientHandler = type => {
		const oldCount = this.state.ingredients[type];
		const updatedCount = oldCount + 1;

		const updatedIngredients = {
			...this.state.ingredients
		};
		updatedIngredients[type] = updatedCount;
		const oldPrice = this.state.totalPrice;
		const updatedPrice = oldPrice + INGREDIENTS_PRICES[type];

		this.setState({
			ingredients: updatedIngredients,
			totalPrice: updatedPrice
		});
		this.updatePurchaseState(updatedPrice);
	};
	removeIngredientHandler = type => {
		const oldCount = this.state.ingredients[type];
		if (oldCount <= 0) {
			return;
		}
		const updatedCount = oldCount - 1;

		const updatedIngredients = {
			...this.state.ingredients
		};
		updatedIngredients[type] = updatedCount;
		const oldPrice = this.state.totalPrice;
		const updatedPrice = oldPrice - INGREDIENTS_PRICES[type];

		this.setState({
			ingredients: updatedIngredients,
			totalPrice: updatedPrice
		});
		this.updatePurchaseState(updatedPrice);
	};
	purchaseHandler = () => {
		this.setState({ purchasing: true });
	};
	purhaseCancleHandler = () => {
		this.setState({ purchasing: false });
	};
	purchaseContinueHandler = () => {
		// alert('You Continue');
		this.setState({ loading: true });
		const orders = {
			ingredients: this.state.ingredients,
			price: this.state.totalPrice,
			customer: {
				name: 'Meghna Varma',
				street: 'testStreet',
				country: 'India',
				email: 'test@test.com'
			},
			deliveryMethod: 'fastest'
		};
		axios
			.post('/orders.json', orders)
			.then(response =>
				this.setState({ loading: false, purchasing: false })
			)
			.catch(error =>
				this.setState({ loading: false, purchasing: false })
			);
	};
	render() {
		const disabledInfo = {
			...this.state.ingredients
		};
		for (let key in disabledInfo) {
			disabledInfo[key] = disabledInfo[key] <= 0;
		}
		let orderSummary = (
			<OrderSummary
				purhaseCancleHandler={this.purhaseCancleHandler}
				ingredients={this.state.ingredients}
				purchaseContinueHandler={this.purchaseContinueHandler}
				price={this.state.totalPrice}
			/>
		);
		if (this.state.loading) {
			orderSummary = <Spinner />;
		}

		const showModal = this.state.purchasing ? (
			<Modal
				show={this.state.purchasing}
				clicked={this.purhaseCancleHandler}
			>
				{orderSummary}
			</Modal>
		) : null;

		let burger = this.state.error ? (
			<p>Ingredoents can't be loadd!</p>
		) : (
			<Spinner />
		);
		if (this.state.ingredients) {
			burger = (
				<Auxiliary>
					<Burger ingredients={this.state.ingredients} />
					<BuildControls
						addIngredient={this.addIngredientHandler}
						removeIngredient={this.removeIngredientHandler}
						disabled={disabledInfo}
						price={this.state.totalPrice.toFixed(2)}
						purchasable={this.state.purchasable}
						order={this.purchaseHandler}
					/>
				</Auxiliary>
			);
		}
		return (
			<Auxiliary>
				{showModal}
				{burger}
			</Auxiliary>
		);
	}
}

export default BurgerBuilder;
