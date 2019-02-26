import { OrderStatus } from '0x.js';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { getSelectedToken, getUserOrders } from '../../store/selectors';
import { themeColors } from '../../util/theme';
import { tokenAmountInUnits } from '../../util/tokens';
import { OrderSide, StoreState, TabItem, Token, UIOrder } from '../../util/types';
import { Card } from '../common/card';
import { CardTabSelector } from '../common/card_tab_selector';
import { EmptyContent } from '../common/empty_content';
import { CardLoading } from '../common/loading';
import { CustomTD, Table, TH, THead, TR } from '../common/table';

import { CancelOrderButtonContainer } from './cancel_order_button';

interface StateProps {
    orders: UIOrder[];
    selectedToken: Token | null;
}

enum Tab {
    Filled,
    Open,
}

interface State {
    tab: Tab;
}

type Props = StateProps;

const SideTD = styled(CustomTD)<{ side: OrderSide }>`
    color: ${props => (props.side === OrderSide.Buy ? themeColors.green : themeColors.orange)};
`;

const orderToRow = (order: UIOrder, index: number, selectedToken: Token) => {
    const sideLabel = order.side === OrderSide.Sell ? 'Sell' : 'Buy';
    const size = tokenAmountInUnits(order.size, selectedToken.decimals);
    const filled = tokenAmountInUnits(order.filled, selectedToken.decimals);
    const price = order.price.toString();
    const status = order.status === OrderStatus.Fillable ? 'Open' : 'Filled';

    return (
        <TR key={index}>
            <SideTD side={order.side}>{sideLabel}</SideTD>
            <CustomTD>{size}</CustomTD>
            <CustomTD>{filled}</CustomTD>
            <CustomTD>{price}</CustomTD>
            <CustomTD>{status}</CustomTD>
            <CustomTD>
                <CancelOrderButtonContainer order={order} />
            </CustomTD>
        </TR>
    );
};

class OrderHistory extends React.Component<Props, State> {
    public state = {
        tab: Tab.Open,
    };

    public render = () => {
        const { orders, selectedToken } = this.props;

        const openOrders = orders.filter(order => order.status === OrderStatus.Fillable);
        const filledOrders = orders.filter(order => order.status === OrderStatus.FullyFilled);

        const ordersToShow = this.state.tab === Tab.Open ? openOrders : filledOrders;

        const setTabOpen = () => this.setState({ tab: Tab.Open });
        const setTabFilled = () => this.setState({ tab: Tab.Filled });

        const cardTabs: TabItem[] = [
            {
                active: this.state.tab === Tab.Open,
                onClick: setTabOpen,
                text: 'Open',
            },
            {
                active: this.state.tab === Tab.Filled,
                onClick: setTabFilled,
                text: 'Filled',
            },
        ];

        let content: React.ReactNode;

        if (!selectedToken) {
            content = <CardLoading />;
        } else if (!ordersToShow.length) {
            content = <EmptyContent alignAbsoluteCenter={true} text="There are no orders to show" />;
        } else {
            content = (
                <Table isResponsive={true}>
                    <THead>
                        <TR>
                            <TH>Side</TH>
                            <TH>Size ({selectedToken.symbol})</TH>
                            <TH>Filled ({selectedToken.symbol})</TH>
                            <TH>Price (WETH)</TH>
                            <TH>Status</TH>
                            <TH>&nbsp;</TH>
                        </TR>
                    </THead>
                    <tbody>{ordersToShow.map((order, index) => orderToRow(order, index, selectedToken))}</tbody>
                </Table>
            );
        }

        return (
            <Card title="Orders" action={<CardTabSelector tabs={cardTabs} />}>
                {content}
            </Card>
        );
    };
}

const mapStateToProps = (state: StoreState): StateProps => {
    return {
        orders: getUserOrders(state),
        selectedToken: getSelectedToken(state),
    };
};

const OrderHistoryContainer = connect(mapStateToProps)(OrderHistory);

export { OrderHistory, OrderHistoryContainer };