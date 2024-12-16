import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";

interface Participant {
  name: string;
  hasJoined: boolean;
  hasDrawn: boolean;
}

interface Couple {
  person1: string;
  person2: string;
}

interface Game {
  id: string;
  adminName: string;
  participants: Participant[];
  couples: Couple[];
}

export const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [person1, setPerson1] = useState("");
  const [person2, setPerson2] = useState("");
  const [couples, setCouples] = useState<Couple[]>([]);
  const [error, setError] = useState("");

  const addParticipant = () => {
    if (participantName && !participants.includes(participantName)) {
      setParticipants([...participants, participantName]);
      setParticipantName("");
    }
  };

  const addCouple = () => {
    if (person1 && person2 && person1 !== person2) {
      setCouples([...couples, { person1, person2 }]);
      setPerson1("");
      setPerson2("");
    }
  };

  const createGame = async () => {
    try {
      const response = await axios.post(`${API_URL}/game`, {
        adminName,
        participants,
        couples,
      });
      navigate(`/game/${response.data.id}`);
    } catch (err) {
      setError("Erreur lors de la création du jeu");
    }
  };

  return (
    <div className="create-game">
      <h2>Créer une nouvelle partie de Secret Santa</h2>

      <div className="form-group">
        <label>Nom de l'administrateur:</label>
        <input
          type="text"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          placeholder="Votre nom"
        />
      </div>

      <div className="form-group">
        <label>Ajouter un participant:</label>
        <input
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="Nom du participant"
        />
        <button onClick={addParticipant}>Ajouter</button>
      </div>

      <div className="participants-list">
        <h3>Participants:</h3>
        <ul>
          {participants.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>

      <div className="form-group">
        <h3>Ajouter un couple:</h3>
        <select value={person1} onChange={(e) => setPerson1(e.target.value)}>
          <option value="">Sélectionner personne 1</option>
          {participants.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select value={person2} onChange={(e) => setPerson2(e.target.value)}>
          <option value="">Sélectionner personne 2</option>
          {participants.map((name, index) => (
            <option key={index} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button onClick={addCouple}>Ajouter le couple</button>
      </div>

      <div className="couples-list">
        <h3>Couples:</h3>
        <ul>
          {couples.map((couple, index) => (
            <li key={index}>
              {couple.person1} & {couple.person2}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={createGame}
        disabled={!adminName || participants.length < 2}
      >
        Créer la partie
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export const JoinGame: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [drawnName, setDrawnName] = useState("");
  const [error, setError] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`${API_URL}/game/${id}`);
        setGame(response.data);
      } catch (err) {
        setError("Erreur lors du chargement de la partie");
      }
    };
    if (id) {
      fetchGame();
    }
  }, [id]);

  const getParticipantStatus = (participantName: string) => {
    if (!game) return "";

    const participant = game.participants.find(
      (p) => p.name === participantName
    );
    if (!participant) return "";

    const couple = game.couples.find(
      (c) => c.person1 === participantName || c.person2 === participantName
    );

    if (couple) {
      const partner =
        couple.person1 === participantName ? couple.person2 : couple.person1;
      return `(en couple avec ${partner})`;
    }
    return "";
  };

  const joinGame = async () => {
    try {
      await axios.put(`${API_URL}/game/${id}/join`, { name });
      setHasJoined(true);
      setError("");
    } catch (err) {
      setError("Erreur lors de la connexion");
    }
  };

  const drawName = async () => {
    try {
      const response = await axios.post(`${API_URL}/game/${id}/draw`, { name });
      setDrawnName(response.data);
      setError("");
    } catch (err) {
      setError("Erreur lors du tirage au sort");
    }
  };

  if (!game) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="join-game">
      <h2>Partie de Secret Santacaca</h2>
      <p>Créée par: {game.adminName}</p>

      <div className="participants-status">
        <h3>Liste des participants:</h3>
        <ul>
          {game.participants.map((participant, index) => (
            <li key={index} className={participant.hasJoined ? "joined" : ""}>
              {participant.name} {getParticipantStatus(participant.name)}
              {participant.hasDrawn && " "}
            </li>
          ))}
        </ul>
        <p className="legend"> = A déjà tiré un nom</p>
      </div>

      {!hasJoined ? (
        <div className="form-group">
          <label>Votre prénom:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez votre prénom"
          />
          <button onClick={joinGame}>Rejoindre</button>
        </div>
      ) : (
        <div className="draw-section">
          {!drawnName ? (
            <button onClick={drawName}>Tirer au sort</button>
          ) : (
            <p className="drawn-name">
              Vous devez faire un cadeau à: {drawnName}
            </p>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};
