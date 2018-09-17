import React from "react"
import { Crunchyroll } from "../api/crunchroll";
import { Observable } from "rxjs";
import db from "../db";
import _ from "lodash";
import Episode from "../components/episode/episode";


class Series extends React.Component{

  constructor(props){
    super();
    this.state = {
      episodes:[]
    }


    const {location} = props;
    Crunchyroll.getEpisodes(location.state)
  }

  componentDidMount() {
    this.sub = Observable.fromEvent(
      db.episodes.changes({
        since: 0,
        live: true,
        include_docs: true,
      }),
      'change'
    )
      .filter(change => !change.deleted)
      .map(change => change.doc)
      .scan((acc, doc) => acc.concat([doc]), [])
      .debounceTime(1000)
      .subscribe(episodes => this.setState({episodes}));
  }

  componentWillUnmount() {
    this.sub.unsubscribe();

  }
  
  render(){
    const {episodes} = this.state;
    return (
      <div>
        {_.chunk(episodes, 4).map((chunk,i) => (
          <div key = {`chunk_${i}`} className="columns">
            {chunk.map(ep => <Episode key={ep._id} episode={ep}/>)}
          </div>
        ))}
      </div>
    );
  }
}

export default Series;