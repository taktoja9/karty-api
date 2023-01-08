import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { GentelmensCardsService } from './gentelmens-cards.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GentelmensCardsGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  gameStarted = false;
  cardCzar = 0;
  answers = [];

  constructor(
    private readonly gentelmensCardsService: GentelmensCardsService,
  ) {}

  @SubscribeMessage('join')
  joinRoom(
    @MessageBody('name') name: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`${client.id} JOINED`);
    return this.gentelmensCardsService.join(name, client.id);
  }

  @SubscribeMessage('getPlayersList')
  getPlayersList() {
    const players = this.gentelmensCardsService.getPlayersList();

    this.server.emit('playersList', players);
  }

  @SubscribeMessage('setPlayerReady')
  setPlayerReady(
    @MessageBody('clientId') clientId: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`${client.id} SET STATUS READY`);

    this.gentelmensCardsService.setPLayerReady(clientId);
    const players = this.gentelmensCardsService.getPlayersList();

    const isAllReady = players.every((player) => player.ready);

    this.server.emit('playersList', players);

    if (isAllReady) {
      this.gameStarted = true;
      this.server.emit('gameStart');

      this.cardCzar = 0;

      this.gentelmensCardsService.handleStartGame(this.server, this.cardCzar);
    }
  }

  @SubscribeMessage('chooseWinner')
  chooseWinner(
    @MessageBody('clientId')
    clientId: string,
  ) {
    this.gentelmensCardsService.chooseWinner(clientId);

    const players = this.gentelmensCardsService.getPlayersList();

    this.answers = [];

    this.cardCzar++;

    if (this.cardCzar >= players.length) this.cardCzar = 0;

    this.gentelmensCardsService.handleNextTurn(
      this.server,
      players,
      this.cardCzar,
    );
  }

  @SubscribeMessage('winnerOfTheGame')
  pickWinnerOfTheGame() {
    const winner = this.gentelmensCardsService.chooseWinnerOfTheGame();

    this.server.emit('winnerOfTheGameIs', winner);
  }

  @SubscribeMessage('sendAnswer')
  sendAnswer(
    @MessageBody('cards')
    cards: { text: string; id: number; clientId: string }[],
  ) {
    this.answers.push(cards);

    const players = this.gentelmensCardsService.getPlayersList();

    const cardCzar = players.find((player) => player.cardCzar);

    if (this.answers.length === players.length - 1) {
      return this.server.emit('answers', this.answers);
    }

    this.server
      .to(cardCzar.clientId)
      .emit('answers', Array(this.answers.length).fill([]));
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const players = this.gentelmensCardsService.disconnect(client.id);
    this.gentelmensCardsService.setPlayersUnReady();

    this.gameStarted = false;

    this.server.emit('playersList', players);

    this.server.emit('endGame');
  }
}
