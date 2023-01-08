import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import * as _ from 'lodash';

import { generateBlackDeck } from './cards/blackCards';
import { generateWhiteDeck } from './cards/whiteCards';

let WHITE_CARDS;
let BLACK_CARDS;

@Injectable()
export class GentelmensCardsService {
  clientToUser: Record<
    string,
    { name: string; ready: boolean; cardCzar?: boolean; score: number }
  > = {};

  setPLayerReady(clientId: string) {
    this.clientToUser[clientId].ready = true;
  }

  setPlayersUnReady() {
    for (const user of Object.values(this.clientToUser)) {
      user.ready = false;
    }
  }

  join(name: string, clientId: string) {
    this.clientToUser[clientId] = {
      name,
      ready: false,
      score: 0,
    };
  }

  giveUserLeakingCards(clientId: string, howMany: number, server: Server) {
    const whiteCards = [];

    for (let i = 0; i < howMany; i++) {
      const whiteCard = _.sample(WHITE_CARDS);

      const index = WHITE_CARDS.findIndex((card) => card.id === whiteCard.id);

      WHITE_CARDS.splice(index, 1);

      whiteCards.push(whiteCard);
    }

    server.to(clientId).emit('giveMeWhiteCards', whiteCards);
  }

  getPlayersList() {
    const playersListObj = { ...this.clientToUser };

    const playersListArray = [];

    for (const [key, value] of Object.entries(playersListObj)) {
      playersListArray.push({
        clientId: key,
        username: value.name,
        ready: value.ready,
        cardCzar: value?.cardCzar,
        score: value.score,
      });
    }

    return playersListArray;
  }

  disconnect(clientId: string) {
    delete this.clientToUser[clientId];

    const playersListArray = [];

    for (const [key, value] of Object.entries(this.clientToUser)) {
      playersListArray.push({
        clientId: key,
        username: value.name,
        ready: value.ready,
      });
    }

    return playersListArray;
  }

  chooseWinner(clientId: string) {
    this.clientToUser[clientId].score += 1;
  }

  chooseWinnerOfTheGame() {
    const players = this.getPlayersList();

    const sortedPlayers = players.sort((a, b) => b.score - a.score);

    return sortedPlayers[0];
  }

  handleStartGame(server: Server, cardCzar: number) {
    WHITE_CARDS = generateWhiteDeck();
    BLACK_CARDS = generateBlackDeck();

    for (const value of Object.values(this.clientToUser)) {
      value.cardCzar = false;
      value.ready = false;
      value.score = 0;
    }

    const players = this.getPlayersList();

    players.forEach((player) => {
      const whiteCards = [];

      for (let i = 0; i < 10; i++) {
        const whiteCard = _.sample(WHITE_CARDS);

        const index = WHITE_CARDS.findIndex((card) => card.id === whiteCard.id);

        WHITE_CARDS.splice(index, 1);

        whiteCards.push(whiteCard);
      }

      server.to(player.clientId).emit('whiteCards', whiteCards);
    });

    this.selectRandomBlackCard(server);

    this.clientToUser[players[cardCzar].clientId].cardCzar = true;

    players[cardCzar].cardCzar = true;

    server.to(players[cardCzar].clientId).emit('cardCzar');

    server.emit('playersList', players);
  }

  handleNextTurn(server: Server, players: any[], cardCzar: number) {
    players.forEach((player) => {
      if (!player.cardCzar) {
        this.giveUserLeakingCards(player.clientId, 1, server);
      }
    });

    for (const value of Object.values(this.clientToUser)) {
      value.cardCzar = false;
    }

    this.clientToUser[players[cardCzar].clientId].cardCzar = true;

    players.forEach((player) => (player.cardCzar = false));

    players[cardCzar].cardCzar = true;

    server.to(players[cardCzar].clientId).emit('cardCzar');

    server.emit('playersList', players);

    this.selectRandomBlackCard(server);

    server.emit('nextTurn');
  }

  selectRandomBlackCard(server: Server) {
    if (BLACK_CARDS.length === 0) {
      server.emit('endGame');
    }

    const blackCard = _.sample(BLACK_CARDS);

    server.emit('blackCard', blackCard);

    const index = BLACK_CARDS.findIndex((card) => card.id === blackCard.id);

    BLACK_CARDS.splice(index, 1);
  }

  getClientName(clientId: string) {
    return this.clientToUser[clientId];
  }
}
