// Story Interface Component Tests
// Tests for the core interactive storytelling components

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StoryInterface } from '../../components/story/StoryInterface';
import { NarrativeDisplay } from '../../components/story/NarrativeDisplay';
import { ChoiceButtons } from '../../components/story/ChoiceButtons';

// Mock the hooks to avoid localStorage issues in tests
vi.mock('../../hooks/useSessionStorage', () => ({
  useSessionStorage: vi.fn(() => [null, vi.fn(), vi.fn()]),
}));

describe('NarrativeDisplay', () => {
  it('renders narrative text correctly', () => {
    const narrative = 'The bus halts at dawn. Officials demand your ticket. Hand it over? (Y/N)';
    render(<NarrativeDisplay narrative={narrative} />);
    
    expect(screen.getByText(/The bus halts at dawn/)).toBeInTheDocument();
    expect(screen.getByText('(Y/N)')).toBeInTheDocument();
  });

  it('shows generating indicator when loading', () => {
    render(<NarrativeDisplay narrative="Test narrative" isGenerating={true} />);
    
    expect(screen.getByLabelText('Generating next story beat')).toBeInTheDocument();
  });

  it('separates story text from choice prompt', () => {
    const narrative = 'Story text here. (Y/N)';
    render(<NarrativeDisplay narrative={narrative} />);
    
    expect(screen.getByText('Story text here.')).toBeInTheDocument();
    expect(screen.getByText('(Y/N)')).toBeInTheDocument();
  });

  it('handles restart prompt correctly', () => {
    const narrative = 'The story ends here. (Restart?)';
    render(<NarrativeDisplay narrative={narrative} />);
    
    expect(screen.getByText('The story ends here.')).toBeInTheDocument();
    expect(screen.getByText('(Restart?)')).toBeInTheDocument();
  });
});

describe('ChoiceButtons', () => {
  const mockOnChoiceY = vi.fn();
  const mockOnChoiceN = vi.fn();
  const mockOnRestart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Yes and No buttons by default', () => {
    render(
      <ChoiceButtons 
        onChoiceY={mockOnChoiceY} 
        onChoiceN={mockOnChoiceN} 
      />
    );
    
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Y / N')).toBeInTheDocument();
  });

  it('calls onChoiceY when Yes button is clicked', () => {
    render(
      <ChoiceButtons 
        onChoiceY={mockOnChoiceY} 
        onChoiceN={mockOnChoiceN} 
      />
    );
    
    fireEvent.click(screen.getByText('Yes'));
    expect(mockOnChoiceY).toHaveBeenCalledTimes(1);
  });

  it('calls onChoiceN when No button is clicked', () => {
    render(
      <ChoiceButtons 
        onChoiceY={mockOnChoiceY} 
        onChoiceN={mockOnChoiceN} 
      />
    );
    
    fireEvent.click(screen.getByText('No'));
    expect(mockOnChoiceN).toHaveBeenCalledTimes(1);
  });

  it('shows restart button when story is ended', () => {
    render(
      <ChoiceButtons 
        onChoiceY={mockOnChoiceY} 
        onChoiceN={mockOnChoiceN}
        onRestart={mockOnRestart}
        isEnded={true}
      />
    );
    
    expect(screen.getByText('Restart')).toBeInTheDocument();
    expect(screen.queryByText('Yes')).not.toBeInTheDocument();
    expect(screen.queryByText('No')).not.toBeInTheDocument();
  });

  it('disables buttons when generating', () => {
    render(
      <ChoiceButtons 
        onChoiceY={mockOnChoiceY} 
        onChoiceN={mockOnChoiceN}
        isGenerating={true}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Choose Yes' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Choose No' })).toBeDisabled();
  });
});

describe('StoryInterface', () => {
  it('renders initial story state', () => {
    render(<StoryInterface />);
    
    expect(screen.getByText(/The bus halts at dawn/)).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', async () => {
    render(<StoryInterface />);
    
    // Simulate Y key press
    fireEvent.keyDown(document, { key: 'y' });
    
    // Wait for story progression
    await waitFor(() => {
      expect(screen.getByText(/Progress:/)).toBeInTheDocument();
    });
  });

  it('shows accessibility information', () => {
    render(<StoryInterface />);
    
    expect(screen.getByLabelText('Interactive story')).toBeInTheDocument();
    expect(screen.getByLabelText('Story narrative')).toBeInTheDocument();
    expect(screen.getByLabelText('Story choices')).toBeInTheDocument();
  });

  it('accepts initial seed parameter', () => {
    const testSeed = 'test-seed-123';
    render(<StoryInterface initialSeed={testSeed} />);
    
    // The component should render without errors
    expect(screen.getByText(/The bus halts at dawn/)).toBeInTheDocument();
  });
});

describe('Typography and Design Principles', () => {
  it('follows typography-first design with proper semantic structure', () => {
    render(<StoryInterface />);
    
    // Check for proper semantic HTML structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('region')).toBeInTheDocument();
    
    // Check for at least one group (choice buttons group)
    const groups = screen.getAllByRole('group');
    expect(groups.length).toBeGreaterThanOrEqual(1);
    
    // Check for accessibility labels
    expect(screen.getByLabelText('Interactive story')).toBeInTheDocument();
    expect(screen.getByLabelText('Story narrative')).toBeInTheDocument();
  });

  it('provides keyboard navigation hints', () => {
    render(<StoryInterface />);
    
    expect(screen.getByText('Use Y key for Yes, N key for No, or click the buttons')).toBeInTheDocument();
    expect(screen.getByText('Y / N')).toBeInTheDocument();
  });
});