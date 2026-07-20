import { Specification } from '@storynaram/domain-kernel';
import { WorldAggregate } from './world-aggregate';

export class FantasySpecification extends Specification<WorldAggregate> {
  isSatisfiedBy(candidate: WorldAggregate): boolean {
    const genre = candidate.profile.genre.toLowerCase();
    return genre === 'fantasy' || genre === 'high fantasy' || genre === 'dark fantasy';
  }
}

export class SciFiSpecification extends Specification<WorldAggregate> {
  isSatisfiedBy(candidate: WorldAggregate): boolean {
    const genre = candidate.profile.genre.toLowerCase();
    return genre === 'sci-fi' || genre === 'science fiction' || genre === 'scifi' || genre === 'cyberpunk';
  }
}

export class HistoricalSpecification extends Specification<WorldAggregate> {
  isSatisfiedBy(candidate: WorldAggregate): boolean {
    const genre = candidate.profile.genre.toLowerCase();
    return genre === 'historical' || genre === 'historical fiction';
  }
}

export class ModernSpecification extends Specification<WorldAggregate> {
  isSatisfiedBy(candidate: WorldAggregate): boolean {
    const genre = candidate.profile.genre.toLowerCase();
    return genre === 'modern' || genre === 'contemporary';
  }
}

export class PostApocalypticSpecification extends Specification<WorldAggregate> {
  isSatisfiedBy(candidate: WorldAggregate): boolean {
    const genre = candidate.profile.genre.toLowerCase();
    return genre === 'post-apocalyptic' || genre === 'postapocalyptic' || genre === 'apocalyptic' || genre === 'dystopian';
  }
}

export class OpenWorldSpecification extends Specification<WorldAggregate> {
  isSatisfiedBy(candidate: WorldAggregate): boolean {
    return candidate.map.count >= 5;
  }
}

export class SandboxSpecification extends Specification<WorldAggregate> {
  isSatisfiedBy(candidate: WorldAggregate): boolean {
    return candidate.rules.count === 0;
  }
}
